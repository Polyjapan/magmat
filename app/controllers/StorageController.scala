package controllers

import data.{Storage, StorageLocation}
import models.StorageModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import utils.AuthenticationPostfix._

import java.time.Clock
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

/**
 * @author Louis Vialar
 */
class StorageController @Inject()(cc: ControllerComponents, storage: StorageModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {

  /**
   * Gets the storage tree for non-event locations and a given event
   * @param eventId the id of the event, or none to only get non-event locations
   * @return
   */
  def getTree(eventId: Option[Int]): Action[AnyContent] = Action.async { implicit rq =>
    storage.getStorageTree(eventId).map(tree => Ok(Json.toJson(tree)))
  }.requiresAuthentication

  def create: Action[Storage] = Action.async(parse.json[Storage]) { req =>
    storage.create(req.body).map(opt => Ok(Json.toJson(opt)))
  }.requiresAuthentication

  def update(id: Int): Action[Storage] = Action.async(parse.json[Storage]) { req =>
    storage.update(id, req.body).map(opt => Ok(Json.toJson(opt > 0)))
  }.requiresAuthentication

  def delete(id: Int): Action[AnyContent] = Action.async { req =>
    storage.delete(id).map(opt => Ok(Json.toJson(opt)))
  }.requiresAuthentication

  def moveItems(targetStorage: Int) = TODO
  /*
  def moveItems(targetStorage: Int) = Action.async(parse.json(8000)) { req =>
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
  }.requiresAuthentication
   */
}
