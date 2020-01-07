package controllers

import java.time.Clock

import data.StorageLocation
import javax.inject.Inject
import models.StorageModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

import scala.concurrent.ExecutionContext

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
}
