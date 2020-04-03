package controllers

import java.time.Clock

import data.{ExternalLoan, LoanStatus}
import javax.inject.Inject
import models.LoansModel
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, ControllerComponents}
import utils.AuthenticationPostfix._

import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class LoansController @Inject()(cc: ControllerComponents, model: LoansModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def getLoans = Action.async { req =>
    model.getAll.map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getCompleteLoans = Action.async { req =>
    model.getAllComplete.map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getCompleteLoan(id: Int) = Action.async { req =>
    model.getOneComplete(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getLoan(id: Int) = Action.async { req =>
    model.getOne(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def create: Action[ExternalLoan] = Action.async(parse.json[ExternalLoan]) { req =>
    model.create(req.body).map(id => Ok(Json.toJson(id)))
  }.requiresAuthentication

  def changeState(id: Int) = Action.async(parse.json(200)) { req =>
    val targetState = (req.body \ "targetState").as[LoanStatus.Value]

    model.changeState(id, targetState).map(res => {
      if (res > 0) Ok else BadRequest
    })
  }.requiresAuthentication

}
