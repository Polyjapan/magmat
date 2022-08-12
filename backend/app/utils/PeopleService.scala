package utils

import ch.japanimpact.auth.api.UserProfile
import ch.japanimpact.auth.api.apitokens.APITokensService
import ch.japanimpact.staff.api.StaffsApi
import com.google.inject.Inject
import models.UsersModel
import play.api.Configuration
import play.api.libs.json.{Format, JsArray, JsNumber, Json, OFormat}
import play.api.libs.ws.WSClient

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.DurationInt


class PeopleService @Inject()(val ws: WSClient, users: UsersModel, staffs: StaffsApi)(implicit ec: ExecutionContext, conf: Configuration, tokens: APITokensService) {
  private val staffIds: mutable.Map[Int, Int] = mutable.Map()
  private var refreshing: Future[List[StaffsApi.Staff]] = _
  private var lastUpdate = 0L

  private val token = tokens.holder(Set("staff/list/event/*"), Set("staff"), 48.hours)

  private def getStaffs() = {
    // TODO: ideally, this method takes an eventId as parameter instead of always returning the latest event :)
    staffs.getStaffListForCurrentEvent.map(_.toOption.toList.flatten)
  }

  private def updateIfNeeded(): Future[Map[Int, Int]] = {
    val now = System.currentTimeMillis()
    if (lastUpdate + 60 * 5 * 1000 < now) {
      lastUpdate = now
      refreshing = getStaffs()
      refreshing.andThen(_ => refreshing = null)

      refreshing.map(list => {
          staffIds.clear()
        list.foreach(elem => staffIds.put(elem.userId, elem.staffNumber))
          staffIds.toMap
        })
    } else if (refreshing == null) {
      Future(staffIds.toMap)
    } else {
      refreshing.map(r => staffIds.toMap)
    }
  }

  private def getUserId(data: String, map: Map[Int, Int]): Option[Int] = {
    if (data.nonEmpty && data.forall(c => c.isDigit)) data.toIntOption
    else {
      val suffix = data.dropWhile(c => !c.isDigit)
      if (suffix.nonEmpty && suffix.forall(_.isDigit)) {
        val staffId = suffix.toIntOption
        staffId.flatMap(map.get)
      } else None
    }
  }

  def getUser(data: String): Future[Option[UserProfile]] = {
    updateIfNeeded().flatMap(map => {
      getUserId(data, map) match {
        case Some(userId) => users.getUserWithId(userId).map(_.toOption)
        case None => Future.successful(None)
      }
    })
  }

  def searchUsers(data: String): Future[Seq[UserProfile]] = users.searchUsers(data).map(_.toOption.getOrElse(Seq()))

  implicit val profileMapper: OFormat[UserProfile] = Json.format[UserProfile]

  def exportUsers: Future[JsArray] = {
    updateIfNeeded().flatMap(staffIds => {
      users.getAllUsers.map(_.toOption.getOrElse(Seq())).map(users => {
        users.map(user => {
          val json = Json.toJsObject(user)

          staffIds.get(user.id).map(sn => json + ("staffNumber" -> JsNumber(sn))).getOrElse(json)
        })
      })
    }).map(iter => JsArray(iter.toList))
  }

}
