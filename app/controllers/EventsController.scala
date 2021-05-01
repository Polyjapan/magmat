package controllers

import models.EventsModel
import pdi.jwt.JwtSession
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import utils.AuthenticationPostfix._

import java.time.Clock
import javax.inject.Inject
import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class EventsController @Inject()(cc: ControllerComponents, model: EventsModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {

  def getEvent: Action[AnyContent] = Action.async { implicit rq =>
    (
      if (rq.eventId.nonEmpty) model.getEvent(rq.eventId.get)
      else model.getCurrentEvent
      ).map(ev => Ok(Json.toJson(ev))).recover {
      case _ => NotFound
    }
  }.requiresAuthentication

  def getEvents: Action[AnyContent] = Action.async { implicit rq =>
    model.getEvents.map(ev => Ok(Json.toJson(ev))).recover {
      case _ => NotFound
    }
  }.requiresAuthentication

  def switchEvent(id: Int): Action[AnyContent] = Action { implicit rq =>
    val session = JwtSession() + ("user", rq.user)
    val newSession: JwtSession =
      if (id == 0) session else session + ("event", id)

    Ok(Json.toJson(Json.obj("session" -> newSession.serialize)))
  }.requiresAuthentication
}
