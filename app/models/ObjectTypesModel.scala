package models

import anorm.Macro.ColumnNaming
import anorm.SqlParser.scalar
import anorm._
import data._
import utils.SqlUtils

import javax.inject.{Inject, Singleton}
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ObjectTypesModel @Inject()(dbApi: play.api.db.DBApi)(implicit ec: ExecutionContext) {
  private val db = dbApi database "default"

  implicit val parameterList: ToParameterList[ObjectType] = Macro.toParameters[ObjectType]()

  def getAllByEvent(event: Option[Int]): Future[List[ObjectType]] = Future(db.withConnection { implicit connection =>
    val whereClause = event.map(ev => s"(el.event_id = $ev OR el.event_id is null)").getOrElse("el.event_id is null")
    SQL("SELECT ot.* FROM object_types ot LEFT JOIN external_loans el ON el.external_loan_id = ot.part_of_loan WHERE deleted = 0 AND " + whereClause)
      .as(objectTypeParser.*)
  })

  def getObjectTypeTree(eventId: Option[Int] = None): Future[List[ObjectTypeTree]] = getAllByEvent(eventId) map { objects =>
    val map = objects.groupBy(_.parentObjectTypeId).withDefaultValue(List())

    def buildSubTree(ot: ObjectType): ObjectTypeTree = {
      val children = map(ot.objectTypeId).map(buildSubTree)
      ObjectTypeTree(ot, children)
    }

    map(None).map(buildSubTree)
  }

  def create(tpe: ObjectType): Future[Option[Int]] = Future(db.withConnection { implicit conn =>
    Some(SqlUtils.insertOne("object_types", tpe))
  })

  def update(id: Int, tpe: ObjectType): Future[Int] = Future(db.withConnection { implicit conn =>
    val r = SQL("UPDATE object_types SET parent_object_type_id = {parentObjectTypeId}, name = {name}, " +
      "description = {description}, part_of_loan = {partOfLoan} WHERE object_type_id = {id}")
      .bind(tpe)
      .on("id" -> id)
      .executeUpdate()

    SQL("""update object_types join (
          |    WITH RECURSIVE rec(id, parent_id) as (
          |        select object_type_id, parent_object_type_id from object_types where parent_object_type_id = {id}
          |        union all select p.object_type_id, p.parent_object_type_id from object_types p inner join rec on rec.id = p.parent_object_type_id
          |    ) select object_types.object_type_id from object_types left join rec on rec.id = object_types.parent_object_type_id where rec.id is not null or object_types.object_type_id = {id}
          |) as r on r.object_type_id = object_types.object_type_id set part_of_loan = {loanId} where 1""".stripMargin)
      .on("id" -> id, "loanId" -> tpe.partOfLoan)
      .executeUpdate()

    r
  })

  def delete(eventId: Option[Int], id: Int, user: Int): Future[Unit] = Future(db.withConnection { implicit conn =>
    SQL("UPDATE object_types SET deleted = 1 WHERE object_type_id = {id}")
      .on("id" -> id)
      .execute()

    SQL("UPDATE objects SET status = 'DELETED' WHERE object_type_id = {id}")
      .on("id" -> id)
      .execute()

    SQL("INSERT INTO object_logs(object_id, event_id, timestamp, changed_by, user, source_state, target_state, signature) (SELECT object_id, {event}, NOW(), {user}, {user}, status, 'DELETED', NULL FROM objects WHERE object_type_id = {id})")
      .on("id" -> id, "event" -> eventId, "user" -> user)
      .executeInsert()

    ()
  })
}

object ObjectTypesModel {
  private[models] def storageAliaser(beforeLength: Int): ColumnAliaser = {
    val locationLength = 5
    val inconv = (beforeLength + 1 to beforeLength + locationLength)
    val offconv = (beforeLength + locationLength + 1 to beforeLength + 2 * locationLength)

    val sl1 = ColumnAliaser.withPattern(inconv.toSet, "inconv_")
    val sl2 = ColumnAliaser.withPattern(offconv.toSet, "offconv_")

    (column: (Int, ColumnName)) => {
      sl1.apply(column).orElse(sl2.apply(column))
    }
  }
}
