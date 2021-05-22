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
  implicit val storageParams: ToParameterList[Storage] = Macro.toParameters[Storage]()
  implicit val locationParser: RowParser[StorageLocation] = Macro.namedParser[StorageLocation](ColumnNaming.SnakeCase)
  implicit val storageParser: RowParser[Storage] = Macro.namedParser[Storage](ColumnNaming.SnakeCase)

  def getStorageTree(eventId: Option[Int] = None): Future[List[StorageTree]] = Future(db.withConnection { implicit conn =>
    val whereClause = eventId.map(ev => s"WHERE event = $ev OR event IS NULL").getOrElse("WHERE event IS NULL")
    val locs = SQL("SELECT * FROM storage " + whereClause).as(storageParser.*)
    val map = locs.groupBy(_.parentStorageId).withDefaultValue(List())

    def buildSubTree(storage: Storage): StorageTree = {
      val children = map(storage.storageId).map(buildSubTree)
      StorageTree(storage.storageId, storage.parentStorageId, children, storage.storageName, storage.event)
    }

    map(None).map(buildSubTree)
  })

  def getAll: Future[List[Storage]] = Future(db.withConnection { implicit conn =>
    SQL("SELECT * FROM storage").as(storageParser.*)
  })

  def create(body: Storage): Future[Option[Int]] = Future(db.withConnection { implicit conn =>
    SQL("INSERT INTO storage(parent_storage_id, storage_name, event) VALUES ({parentStorageId}, {storageName}, {event})")
      .bind(body)
      .executeInsert(scalar[Int].singleOpt)
  })

  def update(id: Int, body: Storage): Future[Int] = Future(db.withConnection { implicit conn =>
    val r = SQL("UPDATE storage SET parent_storage_id = {parentStorageId}, storage_name = {storageName}, event = {event} WHERE storage_id = {storageId}")
      .bind(body.copy(storageId = Some(id)))
      .executeUpdate()

    // Update the eventId in children
    SQL("""update storage join (
          |    WITH RECURSIVE rec(storage_id, parent_storage_id) as (
          |        select storage_id, parent_storage_id from storage where parent_storage_id = {id}
          |        union all select p.storage_id, p.parent_storage_id from storage p inner join rec on rec.storage_id = p.parent_storage_id
          |    ) select storage.storage_id from storage left join rec on rec.storage_id = storage.storage_id where rec.storage_id is not null or storage.storage_id = {id}
          |) as r on r.storage_id = storage.storage_id set event = {eventId} where 1""".stripMargin)
      .on("id" -> id, "eventId" -> body.event)
      .executeUpdate()

    r
  })

  def delete(id: Int): Future[Boolean] = Future(db.withConnection { implicit conn =>
    SQL("DELETE FROM storage WHERE storage_id = {id}")
      .on("id" -> id)
      .execute()
  })


  // OLD STUFF BELOW


  // TODO

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
