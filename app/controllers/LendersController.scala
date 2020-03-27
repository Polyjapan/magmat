package controllers

import java.time.Clock

import ch.japanimpact.auth.api.AuthorizationUtils._
import data.ExternalLender
import javax.inject.Inject
import models.LendersModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, ControllerComponents}
import utils.AuthHelper._

import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class LendersController @Inject()(cc: ControllerComponents, model: LendersModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock, authorize: AuthorizeActionBuilder) extends AbstractController(cc) {
  def getLenders = authorize.async { req =>
    model.getAll.map(r => Ok(Json.toJson(r)))
  }

  def getLender(id: Int) = authorize.async { req =>
    model.getOne(id).map(r => Ok(Json.toJson(r)))
  }

  def create: Action[ExternalLender] = authorize.async(parse.json[ExternalLender]) { req =>
    model.create(req.body).map(id => Ok(Json.toJson(id)))
  }
}
