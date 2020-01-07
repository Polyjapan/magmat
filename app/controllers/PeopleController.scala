package controllers

import java.time.Clock

import ch.japanimpact.auth.api.AuthApi
import data.UserSession
import javax.inject.Inject
import pdi.jwt.JwtSession
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import utils.PeopleService
import utils.AuthenticationPostfix._

import scala.concurrent.{ExecutionContext, Future}

/**
 * @author Louis Vialar
 */
class PeopleController @Inject()(cc: ControllerComponents, service: PeopleService)(implicit ec: ExecutionContext, clock: Clock, conf: Configuration) extends AbstractController(cc) {

  def getPerson(identifier: String): Action[AnyContent] = Action.async { implicit rq =>
    service.getUser(identifier).map {
      case Left(user) => Ok(Json.toJson(user))
      case Right(_) => NotFound
    }
  }.requiresAuthentication

}
