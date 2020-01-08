package models

import anorm.Macro.ColumnNaming
import anorm._
import anorm.SqlParser._
import data._
import javax.inject.{Inject, Singleton}
import utils.SqlUtils

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class LendersModel @Inject()(dbApi: play.api.db.DBApi)(implicit ec: ExecutionContext) {

  private val db = dbApi database "default"

  implicit val parameterList: ToParameterList[ExternalLender] = Macro.toParameters[ExternalLender]()
  implicit val lenderParser: RowParser[ExternalLender] = Macro.namedParser[ExternalLender]((p: String) => "external_lenders." + ColumnNaming.SnakeCase(p))

  def getAll: Future[List[ExternalLender]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM external_lenders").as(lenderParser.*)
  })

  def getOne(id: Int): Future[Option[ExternalLender]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM external_lenders WHERE external_lender_id = {id}").on("id" -> id).as(lenderParser.singleOpt)
  })

  def create(create: ExternalLender): Future[Int] = Future(db.withConnection { implicit conn =>
    SqlUtils.insertOne("external_lenders", create)
  })

}
