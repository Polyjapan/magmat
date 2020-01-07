package controllers

import java.time.Clock

import data.SingleObject
import javax.inject.Inject
import models.ObjectsModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, ControllerComponents}

import scala.concurrent.{ExecutionContext, Future}

/**
 * @author Louis Vialar
 */
class ObjectsController @Inject()(cc: ControllerComponents, model: ObjectsModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
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
