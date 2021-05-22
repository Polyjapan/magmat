package controllers

import java.time.Clock
import data.{CompleteExternalLoan, ExternalLoan, LoanStatus}

import javax.inject.Inject
import models.{LoansModel, UsersModel}
import play.api.Configuration
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import utils.AuthenticationPostfix._

import scala.concurrent.{ExecutionContext, Future}

/**
 * @author Louis Vialar
 */
class LoansController @Inject()(cc: ControllerComponents, model: LoansModel, users: UsersModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {

  def getCompleteLoans(eventId: Option[Int]): Action[AnyContent] = Action.async { req =>
    model.getAllComplete(eventId)
      .flatMap { loans =>
        val userIds = loans.flatMap(_.externalLoan.userId).toSet
        users.getUsersWithIds(userIds).map {
          case Right(idMapping) =>
            val result = loans.map(loan => loan.copy(user = loan.externalLoan.userId.flatMap(idMapping.unapply)))
            Ok(Json.toJson(result))
          case Left(_) => InternalServerError
        }
      }
  }.requiresAuthentication

  def getCompleteLoan(id: Int): Action[AnyContent] = Action.async { req =>
    model.getOneComplete(id)
      .flatMap {
        case Some(loan) if loan.externalLoan.userId.isDefined =>
          users.getUserWithId(loan.externalLoan.userId.get).map {
            case Right(userProfile) => Some(loan.copy(user = Some(userProfile)))
            case Left(_) => None
          }
        case other => Future.successful(other)
      }
      .map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def create: Action[ExternalLoan] = Action.async(parse.json[ExternalLoan]) { req =>
    model.create(req.body).map(id => Ok(Json.toJson(id)))
  }.requiresAuthentication

  def changeState(id: Int): Action[JsValue] = Action.async(parse.json(200)) { req =>
    val targetState = (req.body \ "targetState").as[LoanStatus.Value]

    model.changeState(id, targetState).map(res => {
      if (res > 0) Ok else BadRequest
    })
  }.requiresAuthentication

}
