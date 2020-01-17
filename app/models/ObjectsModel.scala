package models

import anorm.Macro.ColumnNaming
import anorm.SqlParser.scalar
import anorm._
import data._
import javax.inject.{Inject, Singleton}
import utils.AliaserImplicits._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ObjectsModel @Inject()(dbApi: play.api.db.DBApi, events: EventsModel)(implicit ec: ExecutionContext) {
  private val db = dbApi database "default"

  implicit val parameterList: ToParameterList[SingleObject] = Macro.toParameters[SingleObject]()
  implicit val objectParser: RowParser[SingleObject] = Macro.namedParser[SingleObject]((p: String) => "objects." + ColumnNaming.SnakeCase(p))
  implicit val objectLogParser: RowParser[ObjectLog] = Macro.namedParser[ObjectLog]((p: String) => "object_logs." + ColumnNaming.SnakeCase(p))

  private val completeObjectParser: RowParser[CompleteObject] = {
    val objectType = Macro.namedParser[ObjectType]((p: String) => "object_types." + ColumnNaming.SnakeCase(p))
    val inconvStorage = Macro.namedParser[StorageLocation]((p: String) => "inconv_" + ColumnNaming.SnakeCase(p))
    val offConvStorage = Macro.namedParser[StorageLocation]((p: String) => "offconv_" + ColumnNaming.SnakeCase(p))
    val lender = Macro.namedParser[ExternalLender]((p: String) => "external_lenders." + ColumnNaming.SnakeCase(p))
    val loan = Macro.namedParser[ExternalLoan]((p: String) => "external_loans." + ColumnNaming.SnakeCase(p))

    objectParser ~ objectType ~ inconvStorage.? ~ offConvStorage.? ~ lender.? ~ loan.? map {
      case obj ~ tpe ~ incStor ~ outStor ~ lender ~ loan =>
        CompleteObject(obj, tpe, outStor, incStor, loan.flatMap(loanObject => lender.map(lenderObject => CompleteExternalLoan.merge(loanObject, None, lenderObject))))
    }
  }

  // Don't forget to change the ObjectTypesModel.storageAliaser if you change the request.
  val completeRequest =
    """SELECT * FROM (SELECT o.*,
      | IF(o.inconv_storage_location IS NULL, ot.inconv_storage_location, o.inconv_storage_location) AS actual_inconv_storage,
      | IF(o.storage_location IS NULL, ot.storage_location, o.storage_location) AS actual_offconv_storage,
      | IF(o.part_of_loan IS NULL, ot.part_of_loan, o.part_of_loan) AS actual_part_of_loan
      |  FROM objects o
      |LEFT JOIN object_types ot on o.object_type_id = ot.object_type_id) AS objects
      |LEFT JOIN storage_location sl on objects.actual_inconv_storage = sl.storage_location_id
      |LEFT JOIN storage_location sl2 on objects.actual_offconv_storage = sl2.storage_location_id
      |LEFT JOIN object_types ot on objects.object_type_id = ot.object_type_id
      |LEFT JOIN external_loans el on objects.actual_part_of_loan = el.external_loan_id
      |LEFT JOIN external_lenders e on el.external_lender_id = e.external_lender_id
      |""".stripMargin

  val BeforeLen = 3 + 10 // 10 columns in objects + the 3 magical ones we add

  def getAll: Future[List[SingleObject]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM objects").as(objectParser.*)
  })

  def getAllComplete: Future[List[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest).asTry(completeObjectParser.*, ObjectTypesModel.storageAliaser(BeforeLen)).get
  })

  def getAllByType(typeId: Int): Future[List[SingleObject]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM objects WHERE object_type_id = {id}").on("id" -> typeId).as(objectParser.*)
  })

  def getAllByLocation(locId: Int): Future[List[SingleObject]] = Future(db.withConnection { implicit connection =>
    SQL(
      """SELECT objects.* FROM objects JOIN object_types ot on objects.object_type_id = ot.object_type_id
         | WHERE objects.inconv_storage_location = {loc}
         | OR objects.storage_location = {loc}
         | OR ot.inconv_storage_location = {loc}
         | OR ot.storage_location = {loc}
      """.stripMargin).on("loc" -> locId).as(objectParser.*)
  })

  def getAllByLocationComplete(locId: Int): Future[List[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE objects.actual_inconv_storage = {loc} OR objects.actual_offconv_storage = {loc}").on("loc" -> locId).asTry(completeObjectParser.*, ObjectTypesModel.storageAliaser(BeforeLen)).get
  })

  def getAllByLoanComplete(loanId: Int): Future[List[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE objects.actual_part_of_loan = {loan}").on("loan" -> loanId).asTry(completeObjectParser.*, ObjectTypesModel.storageAliaser(BeforeLen)).get
  })

  def getAllByTypeComplete(typeId: Int): Future[List[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE objects.object_type_id = {id}").on("id" -> typeId).asTry(completeObjectParser.*, ObjectTypesModel.storageAliaser(BeforeLen)).get
  })

  def getOne(id: Int): Future[Option[SingleObject]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM objects WHERE object_id = {id}").on("id" -> id).as(objectParser.singleOpt)
  })

  def getLogs(id: Int): Future[List[ObjectLog]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM object_logs WHERE object_id = {id} ORDER BY timestamp DESC")
      .on("id" -> id)
      .as(objectLogParser.*)
  })

  def changeState(objectId: Int, userId: Int, changedBy: Int, targetState: ObjectStatus.Value, signature: Option[String]): Future[Boolean] = Future({
    val eventId = events.getCurrentEventIdSync()

    db.withConnection { implicit connection =>
      SQL(
        """INSERT INTO object_logs(object_id, event_id, timestamp, changed_by, user, source_state, target_state, signature)
          | (SELECT {objectId}, {eventId}, NOW(), {changedBy}, {userId}, status, {targetState}, {signature} FROM objects WHERE
          | object_id = {objectId} LIMIT 1)""".stripMargin)
        .on(
          "objectId" -> objectId,
          "eventId" -> eventId,
          "userId" -> userId,
          "changedBy" -> changedBy,
          "targetState" -> targetState,
          "signature" -> signature
        )
        .executeUpdate() == 1 && SQL("UPDATE objects SET status = {status} WHERE object_id = {id}")
          .on("id" -> objectId, "status" -> targetState).executeUpdate() == 1
    }
  })

  def getOneByAssetTag(tag: String): Future[Option[SingleObject]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM objects WHERE asset_tag = {tag} LIMIT 1").on("tag" -> tag).as(objectParser.singleOpt)
  })

  def getOneCompleteByAssetTag(tag: String): Future[Option[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE asset_tag = {tag} LIMIT 1").on("tag" -> tag)
      .asTry(completeObjectParser.singleOpt, ObjectTypesModel.storageAliaser(BeforeLen)).get
  })

  def getOneComplete(id: Int): Future[Option[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE object_id = {id}").on("id" -> id)
      .asTry(completeObjectParser.singleOpt, ObjectTypesModel.storageAliaser(BeforeLen)).get
  })

  def insertAll(obj: Array[SingleObject]): Future[Array[Int]] = Future(db.withConnection { implicit conn =>
    val toParams1: ToParameterList[SingleObject] = Macro.toParameters[SingleObject]

    val params1: List[Seq[NamedParameter]] = obj.toList.map(toParams1)
    val names1: List[String] = params1.head.map(_.name).toList
    val colNames = names1.map(ColumnNaming.SnakeCase) mkString ", "
    val placeholders = names1.map { n => s"{$n}" } mkString ", "


    BatchSql(
      s"INSERT INTO objects($colNames) VALUES($placeholders)",
      params1.head,
      params1.tail:_*).execute()
  })
}
