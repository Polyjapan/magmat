package controllers

import java.time.Clock

import data.Guest
import javax.inject.Inject
import models.LendersModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, ControllerComponents}
import utils.AuthenticationPostfix._

import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class GuestsController @Inject()(cc: ControllerComponents, model: LendersModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def getAll = Action.async { req =>
    model.getAll.map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getOne(id: Int) = Action.async { req =>
    model.getOne(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def search(str: String) = Action.async { req =>
    model.search(str).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def create: Action[Guest] = Action.async(parse.json[Guest]) { req =>
    model.create(req.body).map(id => Ok(Json.toJson(id)))
  }.requiresAuthentication
}
