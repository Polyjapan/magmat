package controllers

import java.time.Clock
import data._

import javax.inject.Inject
import models.ObjectTypesModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import services.SSEService
import services.SSEService.{ObjectTypeDeleted, ObjectTypeUpdated}
import utils.AuthenticationPostfix._

import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class ObjectTypesController @Inject()(cc: ControllerComponents, model: ObjectTypesModel, sse: SSEService)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def getObjectTypesTree(eventId: Option[Int]): Action[AnyContent] = Action.async { req =>
    model.getObjectTypeTree(eventId).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def createObjectType: Action[ObjectType] = Action.async(parse.json[ObjectType]) { req =>
    model.create(req.body).map(opt => {
      sse.send(ObjectTypeUpdated(opt.get, req.body.copy(objectTypeId = opt)))
      Ok(Json.toJson(opt))
    })
  }.requiresAuthentication

  def updateObjectType(id: Int): Action[ObjectType] = Action.async(parse.json[ObjectType]) { req =>
    model.update(id, req.body.copy(None)).map(updated => {
      sse.send(ObjectTypeUpdated(id, req.body.copy(objectTypeId = Some(id))))
      Ok(Json.toJson(updated > 0))
    })
  }.requiresAuthentication

  def deleteObjectType(id: Int): Action[AnyContent] = Action.async { req =>
    model.delete(req.eventIdOpt, id, req.user.userId).map(_ => {
      sse.send(ObjectTypeDeleted(id))
      Ok
    })
  }.requiresAuthentication
}
