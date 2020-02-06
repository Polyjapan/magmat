package utils

import ch.japanimpact.auth.api.constants.GeneralErrorCodes
import ch.japanimpact.auth.api.{AuthApi, UserProfile}
import com.google.inject.Inject
import play.api.Configuration
import play.api.libs.ws.WSClient

import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future}


class PeopleService @Inject()(val ws: WSClient, api: AuthApi)(implicit ec: ExecutionContext, conf: Configuration) {
  private val apiBase = conf.get[String]("jistaff.baseUrl")
  private val apiToken = conf.get[String]("jistaff.clientToken")
  private val staffIds: mutable.Map[Int, Int] = mutable.Map()
  private var refreshing: Future[List[List[Int]]] = _
  private var lastUpdate = 0L

  private def getStaffs() = {
    ws.url(apiBase + "/front/staffs")
      .addHttpHeaders("Authorization" -> apiToken)
      .get()
      .map { r =>
        println(r)
        if (r.status == 200) {
          r.json.as[List[List[Int]]]
        } else List.empty[List[Int]]
      }
  }

  private def updateIfNeeded(): Future[Map[Int, Int]] = {
    val now = System.currentTimeMillis()
    if (lastUpdate + 60 * 5 * 1000 < now) {
      lastUpdate = now
      refreshing = getStaffs()
      refreshing.andThen(_ => refreshing = null)

      refreshing.map(list => {
          staffIds.clear()
          list.foreach(elem => staffIds.put(elem(0), elem(1)))
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

  def getUser(data: String): Future[Either[UserProfile, GeneralErrorCodes.ErrorCode]] = {
    updateIfNeeded().flatMap(map => {
      getUserId(data, map) match {
        case Some(userId) => api.getUserProfile(userId)
        case None => Future(Right(GeneralErrorCodes.UserNotFound))
      }
    })
  }

  def searchUsers(data: String): Future[Seq[UserProfile]] = api.searchUser(data)


}
