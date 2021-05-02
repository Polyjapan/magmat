package controllers

import java.time.Clock

import data._
import javax.inject.Inject
import models.ObjectTypesModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, ControllerComponents}
import utils.AuthenticationPostfix._

import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class ObjectTypesController @Inject()(cc: ControllerComponents, model: ObjectTypesModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def getObjectTypes = Action.async { req =>
    model.getAll.map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getObjectTypesByLoan(loan: Int) = Action.async { req =>
    model.getAllByLoan(loan).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getCompleteObjectTypes = Action.async { req =>
    model.getAllComplete.map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getCompleteObjectType(id: Int) = Action.async { req =>
    model.getOneComplete(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getObjectType(id: Int) = Action.async { req =>
    model.getOne(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def createObjectType = Action.async(parse.json[ObjectType]) { req =>
    model.create(req.body).map(opt => Ok(Json.toJson(opt)))
  }.requiresAuthentication

  def updateObjectType(id: Int) = Action.async(parse.json[ObjectType]) { req =>
    model.update(id, req.body.copy(None)).map(updated => Ok(Json.toJson(updated > 0)))
  }.requiresAuthentication

  def deleteObjectType(id: Int) = Action.async { req =>
    model.delete(req.eventId, id, req.user.userId).map(_ => Ok)
  }.requiresAuthentication

}
