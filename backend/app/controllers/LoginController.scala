package controllers

import java.time.Clock
import ch.japanimpact.auth.api.cas.CASService
import data.UserSession
import models.EventsModel

import javax.inject.Inject
import pdi.jwt.JwtSession
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

import scala.concurrent.{ExecutionContext, Future}

/**
 * @author Louis Vialar
 */
class LoginController @Inject()(cc: ControllerComponents, cas: CASService, events: EventsModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def login(ticket: String): Action[AnyContent] = Action.async { implicit rq =>
    cas.proxyValidate(ticket, None) flatMap {
      case Left(err) =>
        Future.successful(BadRequest(Json.obj("error" -> err.errorType.toString, "message" -> err.message)))
      case Right(data) =>
        val session: JwtSession = JwtSession() + ("user", UserSession(data))

        // default to next current event
        events.getCurrentEvent
          .map(event => (event.id, session + ("event", event.id.get)))
          .recover(_ => (None, session))
          .map {
            case (event, session) => Ok(Json.toJson(Json.obj(
              "session" -> session.serialize,
              "event" -> event
            )))
          }
    }
  }
}
