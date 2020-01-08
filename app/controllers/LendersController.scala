package controllers

import java.time.Clock

import data.{ExternalLender, StorageLocation}
import javax.inject.Inject
import models.LendersModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, ControllerComponents}

import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class LendersController @Inject()(cc: ControllerComponents, model: LendersModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def getLenders = Action.async { req =>
    model.getAll.map(r => Ok(Json.toJson(r)))
  }

  def getLender(id: Int) = Action.async { req =>
    model.getOne(id).map(r => Ok(Json.toJson(r)))
  }

  def create: Action[ExternalLender] = Action.async(parse.json[ExternalLender]) { req =>
    model.create(req.body).map(id => Ok(Json.toJson(id)))
  }
}
