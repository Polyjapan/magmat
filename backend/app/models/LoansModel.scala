package models

import java.sql.{PreparedStatement, Timestamp}

import anorm.Macro.ColumnNaming
import anorm.SqlParser.scalar
import anorm._
import data._
import javax.inject.{Inject, Singleton}
import org.joda.time.DateTime
import utils.SqlUtils

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class LoansModel @Inject()(dbApi: play.api.db.DBApi)(implicit ec: ExecutionContext) {

  private val db = dbApi database "default"

  // Should not be necessary but still is, somehow.
  implicit val jodaTimeFix: ToStatement[DateTime] = (s: PreparedStatement, index: Int, v: DateTime) => s.setTimestamp(index, new Timestamp(v.getMillis))
  implicit val parameterList: ToParameterList[ExternalLoan] = Macro.toParameters[ExternalLoan]()

  implicit val loanParser: RowParser[ExternalLoan] = Macro.namedParser[ExternalLoan]((p: String) => ColumnNaming.SnakeCase(p))

  private val completeRequest: String = "SELECT * FROM external_loans NATURAL LEFT JOIN guests"

  private val completeParser: RowParser[CompleteExternalLoan] = loanParser ~ guestsParser.? map {
    case loan ~ lender => CompleteExternalLoan.merge(loan, None, lender)
  }

  def changeState(id: Int, targetState: data.LoanStatus.Value): Future[Int] = Future(db.withConnection { implicit connection =>
    SQL("UPDATE external_loans SET status = {status} WHERE external_loan_id = {id}")
      .on("id" -> id, "status" -> targetState)
      .executeUpdate()
  })

  def getAllComplete(event: Option[Int]): Future[List[CompleteExternalLoan]] = Future(db.withConnection { implicit connection =>
    val whereClause = event.map(evId => s"event_id = $evId or event_id is null").getOrElse("event_id is null")
    SQL(completeRequest + " where " + whereClause).as(completeParser.*)
  })

  def getOneComplete(id: Int): Future[Option[CompleteExternalLoan]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE external_loan_id = {id}").on("id" -> id).as(completeParser.singleOpt)
  })

  def create(create: ExternalLoan): Future[Int] = Future(db.withConnection { implicit conn =>
    SqlUtils.insertOne("external_loans", create)
  })

}
