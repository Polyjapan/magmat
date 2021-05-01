package models

import anorm.Macro.ColumnNaming
import anorm.SqlParser.scalar
import anorm._
import data._
import javax.inject.{Inject, Singleton}

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ObjectTypesModel @Inject()(dbApi: play.api.db.DBApi, events: EventsModel)(implicit ec: ExecutionContext) {
  private val db = dbApi database "default"


  implicit val parameterList: ToParameterList[ObjectType] = Macro.toParameters[ObjectType]()

  def eventId: Int = events.getCurrentEventIdSync

  // Don't forget to change the ObjectTypesModel.storageAliaser if you change the request.
  private val completeObjectRequest: String =
    s"""SELECT * FROM object_types ot
       |LEFT JOIN storage_location sl2 on ot.inconv_storage_location = sl2.storage_location_id
       |LEFT JOIN storage_location sl on ot.storage_location = sl.storage_location_id
       |LEFT JOIN external_loans el on ot.part_of_loan = el.external_loan_id
       |LEFT JOIN external_lenders e on el.external_lender_id = e.external_lender_id""".stripMargin

  private val completeObjectTypeParser: RowParser[CompleteObjectType] = {
    val objectType = Macro.namedParser[ObjectType]((p: String) => "object_types." + ColumnNaming.SnakeCase(p))
    val inconvStorage = Macro.namedParser[StorageLocation]((p: String) => "inconv_" + ColumnNaming.SnakeCase(p))
    val offConvStorage = Macro.namedParser[StorageLocation]((p: String) => "offconv_" + ColumnNaming.SnakeCase(p))
    val lender = Macro.namedParser[ExternalLender]((p: String) => "external_lenders." + ColumnNaming.SnakeCase(p))
    val loan = Macro.namedParser[ExternalLoan]((p: String) => "external_loans." + ColumnNaming.SnakeCase(p))

    objectType ~ inconvStorage.? ~ offConvStorage.? ~ lender.? ~ loan.? map {
      case tpe ~ incStor ~ outStor ~ lender ~ loan =>
        CompleteObjectType(tpe, outStor, incStor,
          loan.flatMap(loanObject => lender.map(lenderObject => CompleteExternalLoan.merge(loanObject, None, lenderObject))))
    }
  }

  private val completeObjectTypeAliaser = ObjectTypesModel.storageAliaser(7)

  def getAll: Future[List[ObjectType]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM object_types WHERE deleted = 0").as(objectTypeParser.*)
  })

  def getAllByLoan(loan: Int): Future[List[ObjectType]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM object_types WHERE part_of_loan = {loan} AND deleted = 0").on("loan" -> loan).as(objectTypeParser.*)
  })

  def getAllComplete: Future[List[CompleteObjectType]] = Future(db.withConnection { implicit connection =>
    SQL(completeObjectRequest + " WHERE deleted = 0").asTry(completeObjectTypeParser.*, completeObjectTypeAliaser).get
  })

  def getOne(id: Int): Future[Option[ObjectType]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM object_types WHERE object_type_id = {id} AND deleted = 0").on("id" -> id).as(objectTypeParser.singleOpt)
  })

  def getOneComplete(id: Int): Future[Option[CompleteObjectType]] = Future(db.withConnection { implicit connection =>
    SQL(completeObjectRequest + " WHERE object_type_id = {id} AND deleted = 0").on("id" -> id)
      .asTry(completeObjectTypeParser.singleOpt, completeObjectTypeAliaser).get
  })

  def create(tpe: ObjectType): Future[Option[Int]] = Future(db.withConnection { implicit conn =>
    val parser = scalar[Int]
    SQL("INSERT INTO object_types(name, description, storage_location, inconv_storage_location, part_of_loan, requires_signature) " +
      "VALUES ({name}, {description}, {storageLocation}, {inconvStorageLocation}, {partOfLoan}, {requiresSignature})")
      .bind(tpe)
      .executeInsert(scalar[Int].singleOpt)
  })

  def update(id: Int, tpe: ObjectType): Future[Int] = Future(db.withConnection { implicit conn =>
    val parser = scalar[Int]
    SQL("UPDATE object_types SET name = {name}, description = {description}, storage_location = {storageLocation}, " +
      "inconv_storage_location = {inconvStorageLocation}, part_of_loan = {partOfLoan}, requires_signature = {requiresSignature} WHERE object_type_id = {id}")
      .bind(tpe)
      .on("id" -> id)
      .executeUpdate()
  })

  def delete(id: Int, user: Int): Future[Unit] = Future(db.withConnection { implicit conn =>
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
