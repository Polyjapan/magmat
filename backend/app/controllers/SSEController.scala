package controllers

import data.UserSession
import pdi.jwt.JwtSession
import play.api.Configuration
import play.api.http.ContentTypes
import play.api.libs.EventSource
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import services.SSEService
import utils.AuthenticationPostfix._

import java.time.Clock
import javax.inject.Inject
import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class SSEController @Inject()(service: SSEService, cc: ControllerComponents)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def subscribe(token: Option[String]): Action[AnyContent] = Action { request =>
    val user = request.optUser.orElse(
      token.map(JwtSession.deserialize)
        .filter(_.claim.isValid)
        .flatMap(_.getAs[UserSession]("user")))

    user match {
      case None =>
        Unauthorized
      case Some(_) =>
        Ok.chunked(service.subscribe via EventSource.flow).as(ContentTypes.EVENT_STREAM)
    }
  }
}
