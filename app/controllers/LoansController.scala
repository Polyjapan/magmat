package controllers

import java.time.Clock

import data.StorageLocation
import javax.inject.Inject
import models.{LoansModel, StorageModel}
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

import scala.concurrent.ExecutionContext

/**
 * @author Louis Vialar
 */
class LoansController @Inject()(cc: ControllerComponents, model
: LoansModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def getLoans = Action.async { req =>
    model.getAll.map(r => Ok(Json.toJson(r)))
  }

  def getCompleteLoans = Action.async { req =>
    model.getAllComplete.map(r => Ok(Json.toJson(r)))
  }

  def getCompleteLoan(id: Int) = Action.async { req =>
    model.getOneComplete(id).map(r => Ok(Json.toJson(r)))
  }

  def getLoan(id: Int) = Action.async { req =>
    model.getOne(id).map(r => Ok(Json.toJson(r)))
  }
}
