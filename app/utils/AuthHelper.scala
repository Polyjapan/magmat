package utils

import ch.japanimpact.auth.api.AuthorizationUtils._
import javax.inject.Inject
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

/**
 * Utility class to remove some boilerplate regarding authentication on the endpoints
 *
 * @author Louis Vialar
 */
object AuthHelper {
  case class Authorize[A](action: Action[A])(implicit userAction: UserAction, ec: ExecutionContext) extends Action[A] {
    def apply(request: Request[A]): Future[Result] = {
      userAction.andThen(PermissionCheckAction(Set("magmat"))).async(action.parser) { request =>
        action(request)
      }(request)
    }

    override def parser = action.parser

    override def executionContext = action.executionContext
  }

  class AuthorizeActionBuilder @Inject()(val parser: BodyParsers.Default)(implicit ec: ExecutionContext, userAction: UserAction) extends ActionBuilder[UserRequest, AnyContent] {
    override def invokeBlock[A](request: Request[A], block: (UserRequest[A]) => Future[Result]) = {
      block(request.asInstanceOf[UserRequest[A]])
    }

    override def composeAction[A](action: Action[A]) = Authorize(action)

    override protected def executionContext: ExecutionContext = ec
  }

  implicit class AuthenticationPostfix[T](action: Action[T]) {
    def requiresAuthentication(implicit authorizeActionBuilder: AuthorizeActionBuilder, ec: ExecutionContext): Action[T] = authorizeActionBuilder.composeAction(action)
  }
}
