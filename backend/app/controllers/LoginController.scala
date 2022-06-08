package controllers

import java.time.Clock

import ch.japanimpact.auth.api.cas.CASService
import data.UserSession
import javax.inject.Inject
import pdi.jwt.JwtSession
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class LoginController @Inject()(cc: ControllerComponents, cas: CASService)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def login(ticket: String): Action[AnyContent] = Action.async { implicit rq =>
    cas.proxyValidate(ticket, None) map {
      case Left(err) =>
        BadRequest(Json.obj("error" -> err.errorType.toString, "message" -> err.message))
      case Right(data) =>
        val session: JwtSession = JwtSession() + ("user", UserSession(data))

        Ok(Json.toJson(Json.obj("session" -> session.serialize)))
    }
  }
}
