package controllers

import java.time.Clock

import javax.inject.Inject
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import utils.AuthenticationPostfix._
import utils.PeopleService

import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class PeopleController @Inject()(cc: ControllerComponents, service: PeopleService)(implicit ec: ExecutionContext, clock: Clock, conf: Configuration) extends AbstractController(cc) {

  def getPerson(identifier: String): Action[AnyContent] = Action.async { implicit rq =>
    service.getUser(identifier).map {
      case Some(user) => Ok(Json.toJson(user))
      case _ => NotFound
    }
  }.requiresAuthentication

  def searchPersons(identifier: String): Action[AnyContent] = Action.async { implicit rq =>
    service.searchUsers(identifier).map { lst => Ok(Json.toJson(lst)) }
  }.requiresAuthentication

  def exportUsers: Action[AnyContent] = Action.async { implicit rq =>
    service.exportUsers.map(lst => Ok(lst))
  }.requiresAuthentication

}
