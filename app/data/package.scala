import java.sql.PreparedStatement

import anorm.Macro.ColumnNaming
import anorm.{Column, Macro, RowParser, ToStatement}
import ch.japanimpact.auth.api.UserProfile
import org.joda.time.DateTime
import play.api.libs.json._
import ch.japanimpact.api.events.events.Event

package object data {

  case class Storage(storageId: Option[Int], parentStorageId: Option[Int], storageName: String, event: Option[Int])

  //case class StorageWithParents(storageId: Option[Int], parent: Option[StorageWithParents], storageName: String, event: Option[Int])

  case class StorageTree(storageId: Option[Int], parentStorageId: Option[Int], children: List[StorageTree], storageName: String, event: Option[Int])

  case class StorageLocation(storageLocationId: Option[Int], inConv: Boolean, room: String, space: Option[String], location: Option[String])

  case class ObjectType(objectTypeId: Option[Int], name: String, description: Option[String], storageLocation: Option[Int],
                        inconvStorageLocation: Option[Int], partOfLoan: Option[Int], requiresSignature: Boolean)

  case class CompleteObjectType(objectType: ObjectType, partOfLoanObject: Option[CompleteExternalLoan])

  case class Guest(guestId: Option[Int], name: String, organization: Option[String], description: Option[String],
                   phoneNumber: Option[String], email: Option[String], location: Option[String])

  object ObjectStatus extends Enumeration {
    type ObjectStatus = Value
    val InStock, Out, Lost, Resting, Deleted = Value
  }

  object LoanStatus extends Enumeration {
    type LoanStatus = Value
    val AwaitingPickup, AwaitingReturn, Returned = Value
  }


  case class ObjectLog(objectId: Int, eventId: Int, timestamp: DateTime, changedBy: Int, user: Option[Int],
                       guestId: Option[Int], sourceState: ObjectStatus.Value, targetState: ObjectStatus.Value, signature: Option[String])

  case class ObjectLogWithUser(objectLog: ObjectLog, changedBy: Option[UserProfile], user: Option[UserProfile], guest: Option[Guest])

  case class ObjectLogWithObject(objectLog: ObjectLog, `object`: SingleObject, objectType: ObjectType)

  case class ObjectComment(objectId: Int, eventId: Int, timestamp: DateTime, writer: Int, comment: String)

  case class CompleteObjectComment(objectComment: ObjectComment, writer: UserProfile)

  case class SingleObject(objectId: Option[Int], objectTypeId: Int, suffix: String, description: Option[String],
                          storageLocation: Option[Int], inconvStorageLocation: Option[Int], partOfLoan: Option[Int],
                          reservedFor: Option[Int], assetTag: Option[String], status: ObjectStatus.Value, plannedUse: Option[String] = None, depositPlace: Option[String] = None)

  case class CompleteObject(`object`: SingleObject, objectType: ObjectType,
                            partOfLoanObject: Option[CompleteExternalLoan],
                            reservedFor: Option[UserProfile] = None)

  case class ExternalLoan(externalLoanId: Option[Int], guestId: Option[Int], userId: Option[Int], eventId: Int, pickupTime: DateTime,
                          returnTime: DateTime, loanDetails: Option[String], pickupPlace: Option[String], returnPlace: Option[String],
                          loanTitle: String, status: LoanStatus.Value)

  case class CompleteExternalLoan(externalLoan: ExternalLoan, event: Option[Event], guest: Option[Guest], user: Option[UserProfile])

  object CompleteExternalLoan {
    def merge(externalLoan: ExternalLoan, event: Option[Event], lender: Option[Guest]) =
      CompleteExternalLoan(
        externalLoan.copy(
          pickupPlace = externalLoan.pickupPlace.orElse(lender.flatMap(_.location)),
          returnPlace = externalLoan.returnPlace.orElse(externalLoan.pickupPlace).orElse(lender.flatMap(_.location))
        ), event, lender, None)
  }

  implicit val loanStatusFormat: Format[LoanStatus.Value] = Json.formatEnum(LoanStatus)
  implicit val loanStatusStatement: ToStatement[LoanStatus.Value] = (s: PreparedStatement, index: Int, v: LoanStatus.Value) =>
    s.setString(index, v match {
      case LoanStatus.AwaitingPickup => "AWAITING_PICKUP"
      case LoanStatus.AwaitingReturn => "AWAITING_RETURN"
      case LoanStatus.Returned => "RETURNED"
    })

  implicit def columnToLoanStatus: Column[LoanStatus.Value] =
    Column.columnToString.map {
      case "AWAITING_PICKUP" => LoanStatus.AwaitingPickup
      case "AWAITING_RETURN" => LoanStatus.AwaitingReturn
      case "RETURNED" => LoanStatus.Returned
    }

  implicit val objectStatusFormat: Format[ObjectStatus.Value] = Json.formatEnum(ObjectStatus)

  implicit def columnToObjectStatus: Column[ObjectStatus.Value] =
    Column.columnToString.map {
      case "IN_STOCK" => ObjectStatus.InStock
      case "OUT" => ObjectStatus.Out
      case "LOST" => ObjectStatus.Lost
      case "RESTING" => ObjectStatus.Resting
      case "DELETED" => ObjectStatus.Deleted

    }

  implicit val objectStatusStatement: ToStatement[ObjectStatus.Value] = (s: PreparedStatement, index: Int, v: ObjectStatus.Value) =>
    s.setString(index, v match {
      case ObjectStatus.InStock => "IN_STOCK"
      case ObjectStatus.Out => "OUT"
      case ObjectStatus.Lost => "LOST"
      case ObjectStatus.Resting => "RESTING"
      case ObjectStatus.Deleted => "DELETED"
    })

  implicit val datetimeRead: Reads[DateTime] = JodaReads.DefaultJodaDateTimeReads
  implicit val datetimeWrite: Writes[DateTime] = JodaWrites.JodaDateTimeWrites
  implicit val lender: Format[Guest] = Json.format[Guest]
  implicit val loan: Format[ExternalLoan] = Json.format[ExternalLoan]
  implicit val completeLoan: OFormat[CompleteExternalLoan] = Json.format[CompleteExternalLoan]
  implicit val locationJson: Format[StorageLocation] = Json.format[StorageLocation]
  implicit val storageJson: Format[Storage] = Json.format[Storage]
  implicit val storageTreeJson: OFormat[StorageTree] = Json.format[StorageTree]
  implicit val typeJson: Format[ObjectType] = Json.format[ObjectType]
  implicit val completeTypeJson: Format[CompleteObjectType] = Json.format[CompleteObjectType]
  implicit val obj: OFormat[SingleObject] = Json.format[SingleObject]
  implicit val complObj: Format[CompleteObject] = Json.format[CompleteObject]
  implicit val objLog: Format[ObjectLog] = Json.format[ObjectLog]
  implicit val complObjLog: Format[ObjectLogWithUser] = Json.format[ObjectLogWithUser]
  implicit val complObjLogWithObj: Format[ObjectLogWithObject] = Json.format[ObjectLogWithObject]
  implicit val objComment: Format[ObjectComment] = Json.format[ObjectComment]
  implicit val complObjComment: Format[CompleteObjectComment] = Json.format[CompleteObjectComment]
  implicit val guestsParser: RowParser[Guest] = Macro.namedParser[Guest](ColumnNaming.SnakeCase)

  implicit val objectTypeParser: RowParser[ObjectType] = Macro.namedParser[ObjectType](ColumnNaming.SnakeCase)

}
