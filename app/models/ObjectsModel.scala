package models

import anorm.Macro.ColumnNaming
import anorm._
import data._
import javax.inject.{Inject, Singleton}

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ObjectsModel @Inject()(dbApi: play.api.db.DBApi, events: EventsModel, users: UsersModel)(implicit ec: ExecutionContext) {

  private val db = dbApi database "default"

  implicit val parameterList: ToParameterList[SingleObject] = Macro.toParameters[SingleObject]()
  implicit val objectParser: RowParser[SingleObject] = Macro.namedParser[SingleObject]((p: String) => "objects." + ColumnNaming.SnakeCase(p))
  implicit val objectLogParser: RowParser[ObjectLog] = Macro.namedParser[ObjectLog]((p: String) => "object_logs." + ColumnNaming.SnakeCase(p))
  implicit val objectCommentParser: RowParser[ObjectComment] = Macro.namedParser[ObjectComment]((p: String) => "objects_comments." + ColumnNaming.SnakeCase(p))

  private val completeObjectParser: RowParser[CompleteObject] = {
    val objectType = Macro.namedParser[ObjectType]((p: String) => "object_types." + ColumnNaming.SnakeCase(p))
    val inconvStorage = Macro.namedParser[StorageLocation]((p: String) => "inconv_" + ColumnNaming.SnakeCase(p))
    val offConvStorage = Macro.namedParser[StorageLocation]((p: String) => "offconv_" + ColumnNaming.SnakeCase(p))
    val lender = Macro.namedParser[Guest]((p: String) => "guests." + ColumnNaming.SnakeCase(p))
    val loan = Macro.namedParser[ExternalLoan]((p: String) => "external_loans." + ColumnNaming.SnakeCase(p))

    objectParser ~ objectType ~ inconvStorage.? ~ offConvStorage.? ~ lender.? ~ loan.? map {
      case obj ~ tpe ~ incStor ~ outStor ~ lender ~ loan =>
        CompleteObject(obj, tpe, outStor, incStor, loan.map(loanObject => CompleteExternalLoan.merge(loanObject, None, lender)))
    }
  }

  private def collectReservedFor(objects: List[CompleteObject]): Future[List[CompleteObject]] = {
    val reservedForSet = objects.flatMap(_.`object`.reservedFor).toSet

    if (reservedForSet.isEmpty) {
      Future.successful(objects)
    } else {
      users.getUsersWithIds(reservedForSet).map {
        case Right(idMap) => objects.map(o => o.copy(reservedFor = o.`object`.reservedFor.flatMap(idMap.unapply)))
        case Left(_) => objects
      }
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
      |LEFT JOIN guests e on el.guest_id = e.guest_id
      |""".stripMargin

  val BeforeLen = 3 + 12 // 12 columns in objects + the 3 magical ones we add

  def getAll: Future[List[SingleObject]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM objects WHERE status != 'DELETED'").as(objectParser.*)
  })

  def getAllComplete: Future[List[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE objects.status != 'DELETED'").asTry(completeObjectParser.*, ObjectTypesModel.storageAliaser(BeforeLen)).get
  }).flatMap(collectReservedFor)

  def getAllByType(typeId: Int): Future[List[SingleObject]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM objects WHERE object_type_id = {id} AND status != 'DELETED'").on("id" -> typeId).as(objectParser.*)
  })

  def getAllByLocation(locId: Int): Future[List[SingleObject]] = Future(db.withConnection { implicit connection =>
    SQL(
      """SELECT objects.* FROM objects JOIN object_types ot on objects.object_type_id = ot.object_type_id
        | WHERE (objects.inconv_storage_location = {loc}
        | OR objects.storage_location = {loc}
        | OR ot.inconv_storage_location = {loc}
        | OR ot.storage_location = {loc}) AND status != 'DELETED'
      """.stripMargin).on("loc" -> locId).as(objectParser.*)
  })

  def getAllByLocationComplete(locId: Int): Future[List[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE (objects.actual_inconv_storage = {loc} OR objects.actual_offconv_storage = {loc}) AND objects.status != 'DELETED'").on("loc" -> locId).asTry(completeObjectParser.*, ObjectTypesModel.storageAliaser(BeforeLen)).get
  }).flatMap(collectReservedFor)

  def getAllByLoanComplete(loanId: Int): Future[List[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE objects.actual_part_of_loan = {loan} AND objects.status != 'DELETED'").on("loan" -> loanId).asTry(completeObjectParser.*, ObjectTypesModel.storageAliaser(BeforeLen)).get
  }).flatMap(collectReservedFor)

  def getAllByTypeComplete(typeId: Int): Future[List[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE objects.object_type_id = {id} AND objects.status != 'DELETED'").on("id" -> typeId).asTry(completeObjectParser.*, ObjectTypesModel.storageAliaser(BeforeLen)).get
  }).flatMap(collectReservedFor)

  def getOne(id: Int): Future[Option[SingleObject]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM objects WHERE object_id = {id}").on("id" -> id).as(objectParser.singleOpt)
  })

  def getLogs(eventId: Int, id: Int): Future[List[ObjectLogWithUser]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM object_logs WHERE object_id = {id} AND event_id = {eventId} ORDER BY timestamp DESC")
      .on("id" -> id, "eventId" -> eventId)
      .as((objectLogParser ~ guestsParser.?).map {
        case objLog ~ optGuest => ObjectLogWithUser(objLog, None, None, optGuest)
      }.*)
  })

  def getComments(eventId: Int, id: Int): Future[List[ObjectComment]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM objects_comments WHERE object_id = {id} AND event_id = {eventId} ORDER BY timestamp DESC")
      .on("id" -> id, "eventId" -> eventId)
      .as(objectCommentParser.*)
  })

  def addComment(eventId: Int, objectId: Int, userId: Int, message: String) = Future(db.withConnection { implicit c =>
    SQL("INSERT INTO objects_comments(object_id, event_id, timestamp, writer, comment) VALUES ({id}, {ev}, NOW(), {user}, {message})")
      .on("id" -> objectId, "ev" -> eventId, "user" -> userId, "message" -> message)
      .executeInsert()
  })

  def changeState(eventId: Int, objectId: Int, userId: Int, changedBy: Int, targetState: ObjectStatus.Value, signature: Option[String]): Future[Boolean] = Future({
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
        .executeUpdate() == 1 && SQL("UPDATE objects SET status = {status} WHERE object_id = {id} AND status != 'DELETED'")
        .on("id" -> objectId, "status" -> targetState).executeUpdate() == 1
    }
  })

  def getOneByAssetTag(tag: String): Future[Option[SingleObject]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM objects WHERE asset_tag = {tag} LIMIT 1").on("tag" -> tag).as(objectParser.singleOpt)
  })

  def getOneCompleteByAssetTag(tag: String): Future[Option[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE asset_tag = {tag} LIMIT 1").on("tag" -> tag)
      .asTry(completeObjectParser.singleOpt, ObjectTypesModel.storageAliaser(BeforeLen)).get
  }).flatMap(t => collectReservedFor(t.toList).map(_.headOption))

  def getOneComplete(id: Int): Future[Option[CompleteObject]] = Future(db.withConnection { implicit connection =>
    SQL(completeRequest + " WHERE object_id = {id}").on("id" -> id)
      .asTry(completeObjectParser.singleOpt, ObjectTypesModel.storageAliaser(BeforeLen)).get
  }).flatMap(t => collectReservedFor(t.toList).map(_.headOption))


  def updateOne(id: Int, body: SingleObject) = Future(db.withConnection { implicit conn =>
    val colNames = List("objectTypeId", "suffix", "description", "storageLocation", "inconvStorageLocation", "partOfLoan", "reservedFor", "assetTag", "plannedUse", "depositPlace").map(name => s"${ColumnNaming.SnakeCase(name)} = {$name}") mkString ", "

    SQL(s"UPDATE objects SET $colNames WHERE object_id = {objectId}").bind(body.copy(objectId = Some(id))).executeUpdate()
  })


  def insertAll(obj: Array[SingleObject]): Future[Array[Int]] = Future(db.withConnection { implicit conn =>
    val params1: List[Seq[NamedParameter]] = obj.toList.map(parameterList)
    val names1: List[String] = params1.head.map(_.name).toList
    val colNames = names1.map(ColumnNaming.SnakeCase) mkString ", "
    val placeholders = names1.map { n => s"{$n}" } mkString ", "


    BatchSql(
      s"INSERT INTO objects($colNames) VALUES($placeholders)",
      params1.head,
      params1.tail: _*).execute()
  })

  def getObjectsLoanedTo(user: Int) = Future(db.withConnection { implicit c =>
    SQL("SELECT T.object_id FROM object_logs ol JOIN (SELECT object_id, MAX(timestamp) as latest_log FROM object_logs GROUP BY object_id) T ON T.object_id = ol.object_id AND T.latest_log = ol.timestamp WHERE target_state != 'IN_STOCK' AND user = {user} AND target_state != 'DELETED'")
      .on("user" -> user)
      .as(SqlParser.scalar[Int].*)
  }).map(objects => objects.map(getOneComplete))
    .flatMap(objects => Future.foldLeft(objects)(List.empty[CompleteObject])((lst, elem) => if (elem.isDefined) elem.get :: lst else lst))

  def getObjectsLoaned = Future(db.withConnection { implicit c =>
    SQL("SELECT T.object_id, user FROM object_logs ol JOIN (SELECT object_id, MAX(timestamp) as latest_log FROM object_logs GROUP BY object_id) T ON T.object_id = ol.object_id AND T.latest_log = ol.timestamp WHERE target_state != 'IN_STOCK' AND target_state != 'DELETED'")
      .as((SqlParser.int("object_id") ~ SqlParser.int("user")).*)
  })
    .map(objects => objects.map { case id ~ user => getOneComplete(id).map(obj => obj.map(o => (o, user))) })
    .flatMap(objects => Future.foldLeft(objects)(List.empty[(CompleteObject, Int)])((lst, elem) => if (elem.isDefined) elem.get :: lst else lst))

  def getUserHistory(eventId: Int, id: Int): Future[List[ObjectLogWithObject]] = Future(db.withConnection { implicit connection =>
    SQL("SELECT * FROM object_logs JOIN objects o on object_logs.object_id = o.object_id JOIN object_types ot on o.object_type_id = ot.object_type_id WHERE user = {id} AND event_id = {eventId} ORDER BY timestamp DESC")
      .on("id" -> id, "eventId" -> eventId)
      .as(((objectLogParser ~ objectParser ~ objectTypeParser)
        .map { case log ~ o ~ ot => ObjectLogWithObject(log, o, ot) }).*)
  })

}
