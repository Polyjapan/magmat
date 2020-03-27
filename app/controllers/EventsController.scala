package controllers

import java.time.Clock

import javax.inject.Inject
import models.EventsModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, ControllerComponents}
import utils.AuthHelper.AuthorizeActionBuilder

import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class EventsController @Inject()(cc: ControllerComponents, model: EventsModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock, authorize: AuthorizeActionBuilder) extends AbstractController(cc) {
  def getCurrentEvent = authorize.async { implicit r =>
    model.getCurrentEvent().map(r => Ok(Json.toJson(r)))
  }
}
