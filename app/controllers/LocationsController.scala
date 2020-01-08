package controllers

import java.time.Clock

import data.{ObjectStatus, StorageLocation}
import javax.inject.Inject
import models.StorageModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

import scala.concurrent.{ExecutionContext, Future}

/**
 * @author Louis Vialar
 */
class LocationsController @Inject()(cc: ControllerComponents, storage: StorageModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {

  def getAll: Action[AnyContent] = Action.async { implicit rq =>
    storage.getAll.map(lst => Ok(Json.toJson(lst)))
  }

  def getAllByInConv(inConv: Boolean): Action[AnyContent] = Action.async { implicit rq =>
    storage.getAllByInConv(inConv).map(lst => Ok(Json.toJson(lst)))
  }

  def getOne(id: Int): Action[AnyContent] = Action.async { implicit rq =>
    storage.getOne(id).map(lst => Ok(Json.toJson(lst)))
  }

  def create: Action[StorageLocation] = Action.async(parse.json[StorageLocation]) { req =>
    storage.create(req.body).map(opt => Ok(Json.toJson(opt)))
  }

  def moveItems(targetStorage: Int) = Action.async(parse.json(8000)) {req =>
    val items = (req.body \ "items").as[List[String]].map(_.trim).filter(_.nonEmpty)
    val moveType = (req.body \ "moveType").as[Boolean]
    val moveAll = moveType && (req.body \ "moveAll").as[Boolean]

    if (items.isEmpty) Future(BadRequest)
    else storage.getOne(targetStorage).flatMap {
      case Some(storageLocation) =>
        (if (moveType) {
          storage.moveItemTypes(items, moveAll, storageLocation)
        } else {
          storage.moveItems(items, storageLocation)
        }).map(res => Ok)
      case None => Future(NotFound)
    }
  }
}
