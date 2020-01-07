package models

import anorm.Macro.ColumnNaming
import anorm._
import data._
import javax.inject.{Inject, Singleton}

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class LoansModel @Inject()(dbApi: play.api.db.DBApi)(implicit ec: ExecutionContext) {
  private val db = dbApi database "default"

  implicit val parameterList: ToParameterList[ObjectType] = Macro.toParameters[ObjectType]()

  implicit val loanParser: RowParser[ExternalLoan] = Macro.namedParser[ExternalLoan]((p: String) => "external_loans." + ColumnNaming.SnakeCase(p))
  implicit val lenderParser: RowParser[ExternalLender] = Macro.namedParser[ExternalLender]((p : String) => "external_lenders." + ColumnNaming.SnakeCase(p))
  implicit val eventParser: RowParser[Event] = Macro.namedParser[Event]((p : String) => "events." + ColumnNaming.SnakeCase(p))

  private val completeRequest: String =
    "SELECT * FROM external_loans el LEFT JOIN external_lenders e on el.external_lender_id = e.external_lender_id"

  private val completeParser: RowParser[CompleteExternalLoan] = loanParser ~ lenderParser ~ eventParser.? map {
    case loan ~ lender ~ event => CompleteExternalLoan.merge(loan, event, lender)
  }

  def getAll: Future[List[ExternalLoan]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM object_types").as(loanParser.*)
  })

  def getAllComplete: Future[List[CompleteExternalLoan]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest).as(completeParser.*)
  })

  def getOne(id: Int): Future[Option[ExternalLoan]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM object_types WHERE object_type_id = {id}").on("id" -> id).as(loanParser.singleOpt)
  })

  def getOneComplete(id: Int): Future[Option[CompleteExternalLoan]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE external_loan_id = {id}").on("id" -> id).as(completeParser.singleOpt)
  })
}
