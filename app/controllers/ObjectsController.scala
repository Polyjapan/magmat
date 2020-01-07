package controllers

import java.time.Clock

import ch.japanimpact.auth.api.AuthApi
import data.ObjectStatus.ObjectStatus
import data.{CompleteObjectLog, ObjectStatus, SingleObject}
import javax.inject.Inject
import models.ObjectsModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, ControllerComponents}

import scala.concurrent.{ExecutionContext, Future}
import utils.AuthenticationPostfix._
/**
 * @author Louis Vialar
 */
class ObjectsController @Inject()(cc: ControllerComponents, model: ObjectsModel, auth: AuthApi)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def getAll = Action.async { req =>
    model.getAll.map(r => Ok(Json.toJson(r)))
  }

  def getAllComplete = Action.async { req =>
    model.getAllComplete.map(r => Ok(Json.toJson(r)))
  }

  def getOneComplete(id: Int) = Action.async { req =>
    model.getOneComplete(id).map(r => Ok(Json.toJson(r)))
  }

  def getOne(id: Int) = Action.async { req =>
    model.getOne(id).map(r => Ok(Json.toJson(r)))
  }

  def getLogs(id: Int) = Action.async { req =>
    model.getLogs(id)
      .flatMap(r => {
        val ids: Set[Int] = r.flatMap(obj => Set(obj.changedBy, obj.user)).toSet
        auth.getUserProfiles(ids).map {
          case Left(map) =>
            Ok(Json.toJson(r.map(log => CompleteObjectLog(log, map(log.changedBy), map(log.user)))))
          case Right(_) => InternalServerError
        }
      })
  }

  def changeState(id: Int) = Action.async(parse.json(200)) {req =>
    val targetState = (req.body \ "targetState").as[ObjectStatus.Value]
    val userId = (req.body \ "userId").as[Int]
    val adminId = req.user.userId

    model.changeState(id, userId, adminId, targetState).map(res => {
      if (res) Ok else BadRequest
    })
  }

  def getByTypeComplete(id: Int) = Action.async { req =>
    model.getAllByTypeComplete(id).map(r => Ok(Json.toJson(r)))
  }

  def getByType(id: Int) = Action.async { req =>
    model.getAllByType(id).map(r => Ok(Json.toJson(r)))
  }

  def createMultiple: Action[Array[SingleObject]] = Action.async(parse.json[Array[SingleObject]]) { req =>
    val tags = req.body.flatMap(obj => obj.assetTag)

    val existingTags = Future.foldLeft(tags.toList.map(tag => model.getOneByAssetTag(tag).map(opt => (opt, tag))))(List.empty[String])((lst, elem) => if (elem._1.isDefined) elem._2 :: lst else lst)

    existingTags.flatMap { existing =>
      val existingTagsSet = existing.toSet
      val (toInsert, notInserted) = req.body.partition(elem => elem.assetTag.isEmpty || !existingTagsSet(elem.assetTag.get))

      if (toInsert.nonEmpty) {
        model.insertAll(toInsert).map(res => (res zip toInsert)
          .map { case (id, obj) => obj.copy(objectId = Some(id)) })
          .map(inserted => Ok(Json.obj("inserted" -> inserted, "notInserted" -> notInserted)))
      } else {
        Future(Ok(Json.obj("inserted" -> List.empty[SingleObject], "notInserted" -> notInserted)))
      }
    }

  }
}
