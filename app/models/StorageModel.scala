package models

import anorm.Macro.{ColumnNaming, ParameterProjection}
import anorm._
import anorm.SqlParser._
import javax.inject.{Inject, Singleton}
import data._
import play.api.mvc.Result

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class StorageModel @Inject()(dbApi: play.api.db.DBApi)(implicit ec: ExecutionContext) {

  private val db = dbApi database "default"

  implicit val locationQueryBuilder: ToParameterList[StorageLocation] = Macro.toParameters[StorageLocation]()
  implicit val locationParser: RowParser[StorageLocation] = Macro.namedParser[StorageLocation](ColumnNaming.SnakeCase)

  def getAll: Future[List[StorageLocation]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM storage_location").as(locationParser.*)
  })

  def getAllByInConv(inConv: Boolean): Future[List[StorageLocation]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM storage_location WHERE in_conv = {inconv}").on("inconv" -> inConv).as(locationParser.*)
  })

  def getOne(id: Int): Future[Option[StorageLocation]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM storage_location WHERE storage_location_id = {id}").on("id" -> id).as(locationParser.singleOpt)
  })

  def create(body: StorageLocation): Future[Option[Int]] = Future(db.withConnection { implicit conn =>
    val parser = scalar[Int]
    SQL("INSERT INTO storage_location(in_conv, room, space, location) VALUES ({inConv}, {room}, {space}, {location})")
      .bind(body)
      .executeInsert(scalar[Int].singleOpt)
  })

}
