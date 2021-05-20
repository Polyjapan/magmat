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
  implicit val storageParser: RowParser[Storage] = Macro.namedParser[Storage](ColumnNaming.SnakeCase)

  def getStorageTree: Future[List[StorageTree]] = Future(db.withConnection { implicit conn =>
    val locs = SQL("SELECT * FROM storage").as(storageParser.*)
    val map = locs.groupBy(_.parentStorageId).withDefaultValue(List())

    def buildSubTree(storage: Storage): StorageTree = {
      val children = map(storage.storageId).map(buildSubTree)
      StorageTree(storage.storageId, storage.parentStorageId, children, storage.storageName, storage.event)
    }

    map(None).map(buildSubTree)
  })

  def getAll: Future[List[StorageLocation]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM storage_location ORDER BY room, space, location").as(locationParser.*)
  })

  def getAllByInConv(inConv: Boolean): Future[List[StorageLocation]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM storage_location WHERE in_conv = {inconv} ORDER BY room, space, location").on("inconv" -> inConv).as(locationParser.*)
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

  def update(id: Int, body: StorageLocation): Future[Int] = Future(db.withConnection { implicit conn =>
    SQL("UPDATE storage_location SET in_conv = {inConv}, room = {room}, space = {space}, location = {location} WHERE storage_location_id = {storageLocationId}")
      .bind(body.copy(storageLocationId = Some(id)))
      .executeUpdate()
  })

  def delete(id: Int): Future[Boolean] = Future(db.withConnection { implicit conn =>
    SQL("DELETE FROM storage_location WHERE storage_location_id = {id}")
      .on("id" -> id)
      .execute()
  })

  def moveItems(items: List[String], targetStorage: StorageLocation) = Future(db.withConnection { implicit conn =>
    val field = if (targetStorage.inConv) "inconv_storage_location" else "storage_location"

    SQL(s"UPDATE objects SET $field = {storageId} WHERE asset_tag IN ({tags})")
      .on("tags" -> items, "storageId" -> targetStorage.storageLocationId.get)
      .executeUpdate()
  })

  def moveItemTypes(items: List[String], moveAll: Boolean, targetStorage: StorageLocation) = Future(db.withConnection { implicit conn =>
    // Get types
    val types = SQL("SELECT object_type_id FROM objects WHERE asset_tag IN ({tags})")
      .on("tags" -> items)
      .as(int("object_type_id").*)

    val field = if (targetStorage.inConv) "inconv_storage_location" else "storage_location"

    if (types.nonEmpty) {
      SQL(s"UPDATE object_types SET $field = {storageId} WHERE object_type_id IN ({ids})")
        .on("ids" -> types, "storageId" -> targetStorage.storageLocationId.get)
        .executeUpdate()

      if (moveAll) {
        SQL(s"UPDATE objects SET $field = NULL WHERE object_type_id IN ({ids})")
          .on("ids" -> types)
          .executeUpdate()
      } else {
        SQL(s"UPDATE objects SET $field = NULL WHERE asset_tag IN ({tags})")
          .on("tags" -> items)
          .executeUpdate()
      }

      true
    } else false
  })

}
