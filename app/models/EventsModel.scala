package models

import anorm.Macro.ColumnNaming
import anorm._
import anorm.SqlParser._
import data._
import javax.inject.{Inject, Singleton}

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class EventsModel @Inject()(dbApi: play.api.db.DBApi)(implicit ec: ExecutionContext) {
  private val db = dbApi database "default"

  implicit val parameterList: ToParameterList[Event] = Macro.toParameters[Event]()
  implicit val eventParser: RowParser[Event] = Macro.namedParser[Event]((p: String) => ColumnNaming.SnakeCase(p))

  def getCurrentEventIdSync() = db.withConnection { implicit conn =>
    SQL("SELECT event_id FROM events ORDER BY event_id DESC LIMIT 1").as(int("event_id").single)
  }

  def getCurrentEventIdAsync(): Future[Int] = Future(getCurrentEventIdSync())
}
