package models

import anorm.Macro.ColumnNaming
import anorm._
import anorm.SqlParser._
import data._
import javax.inject.{Inject, Singleton}
import utils.SqlUtils

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class GuestsModel @Inject()(dbApi: play.api.db.DBApi)(implicit ec: ExecutionContext) {

  private val db = dbApi database "default"

  implicit val parameterList: ToParameterList[Guest] = Macro.toParameters[Guest]()

  def getAll: Future[List[Guest]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM guests").as(guestsParser.*)
  })

  def getOne(id: Int): Future[Option[Guest]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM guests WHERE guest_id = {id}").on("id" -> id).as(guestsParser.singleOpt)
  })

  def search(query: String): Future[Option[Guest]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM guests WHERE name LIKE '%{query}%' OR organization LIKE '%{query}%' = {id}")
      .on("query" -> query)
      .as(guestsParser.singleOpt)
  })

  def create(create: Guest): Future[Int] = Future(db.withConnection { implicit conn =>
    SqlUtils.insertOne("guests", create)
  })

}
