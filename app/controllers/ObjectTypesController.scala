package controllers

import java.time.Clock

import ch.japanimpact.auth.api.AuthApi
import data._
import javax.inject.Inject
import models.ObjectTypesModel
import pdi.jwt.JwtSession
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

import scala.concurrent.{ExecutionContext, Future}

/**
 * @author Louis Vialar
 */
class ObjectTypesController @Inject()(cc: ControllerComponents, model: ObjectTypesModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def getObjectTypes = Action.async { req =>
    model.getAll.map(r => Ok(Json.toJson(r)))
  }

  def getCompleteObjectTypes = Action.async { req =>
    model.getAllComplete.map(r => Ok(Json.toJson(r)))
  }

  def getCompleteObjectType(id: Int) = Action.async { req =>
    model.getOneComplete(id).map(r => Ok(Json.toJson(r)))
  }

  def getObjectType(id: Int) = Action.async { req =>
    model.getOne(id).map(r => Ok(Json.toJson(r)))
  }

  def createObjectType  = Action.async(parse.json[ObjectType]) { req =>
    model.create(req.body).map(opt => Ok(Json.toJson(opt)))
  }

  def updateObjectType(id: Int) = Action.async(parse.json[ObjectType]) { req =>
    model.update(id, req.body.copy(None)).map(updated => Ok(Json.toJson(updated > 0)))
  }

}
