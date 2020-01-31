package controllers

import java.awt.Image
import java.io.{ByteArrayInputStream, ByteArrayOutputStream}
import java.time.Clock
import java.util.Base64

import ch.japanimpact.auth.api.AuthApi
import data.{CompleteObject, CompleteObjectLog, LoanStatus, ObjectStatus, SingleObject, StorageLocation}
import javax.imageio.ImageIO
import javax.inject.Inject
import models.ObjectsModel
import play.api.Configuration
import play.api.libs.json.{JsObject, Json}
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import utils.AuthenticationPostfix._

import scala.collection.MapView
import scala.concurrent.{ExecutionContext, Future}

/**
 * @author Louis Vialar
 */
class ObjectsController @Inject()(cc: ControllerComponents, model: ObjectsModel, auth: AuthApi)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def getAll = Action.async { req =>
    model.getAll.map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def computeTidying = Action.async { req =>
    model.getAllComplete.map(r => {
      def dropUselessValues(lst: List[CompleteObject]) =
       lst.map(_.copy(storageLocationObject = None, inconvStorageLocationObject = None, partOfLoanObject = None))

      def groupLevelTwo(objects: List[CompleteObject]) = {
        val (stored, unstored) = objects.partition(obj => obj.storageLocationObject.isDefined)
        val (loaned, unloaned) = unstored.partition(obj => obj.partOfLoanObject.isDefined)

        val groupedStored = groupLocation[List[CompleteObject]](stored, o => o.storageLocationObject.get, dropUselessValues)
        val groupedLoaned = loaned.groupBy(_.partOfLoanObject.get).map { case (k, v) => Json.obj("loan" -> k, "objects" -> dropUselessValues(v)) }

        Json.obj(
          "stored" -> groupedStored,
          "loaned" -> groupedLoaned,
          "other" -> unloaned
        )
      }

      def groupLocation[T](objects: List[CompleteObject], extract: CompleteObject => StorageLocation, transform: List[CompleteObject] => T): MapView[String, MapView[String, MapView[String, T]]] = {
        objects.groupBy(o => extract(o).room)
          .view.mapValues(v => v.groupBy(o => extract(o).space.getOrElse("Non Renseigné"))
          .view.mapValues(v => v.groupBy(o => extract(o).location.getOrElse("Non Renseigné")).view
          .mapValues(transform)
        )
        )
      }

      val objects =
      // Only the objects that are not in a loan or are in a non returned loan
        r.filterNot(elem => elem.partOfLoanObject.exists(_.externalLoan.status != LoanStatus.AwaitingReturn))

      val (stored, unstored) = objects.partition(obj => obj.inconvStorageLocationObject.isDefined)

      val storedLocation = groupLocation[JsObject](stored, o => o.inconvStorageLocationObject.get, groupLevelTwo)


      val json = Json.obj("stored" -> storedLocation, "unstored" -> groupLevelTwo(unstored))

      Ok(json)
    })
  }.requiresAuthentication

  def getByTag(tag: String) = Action.async { implicit rq =>
    if (tag.length >= 1 && tag.length < 30) {
      model.getOneCompleteByAssetTag(tag).map {
        case Some(obj) => Ok(Json.toJson(obj))
        case None => NotFound
      }
    } else Future(BadRequest)

  }.requiresAuthentication

  def getAllComplete = Action.async { req =>
    model.getAllComplete.map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getOneComplete(id: Int) = Action.async { req =>
    model.getOneComplete(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getOne(id: Int) = Action.async { req =>
    model.getOne(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getLogs(id: Int) = Action.async { req =>
    model.getLogs(id)
      .flatMap(r => {
        val ids: Set[Int] = r.flatMap(obj => Set(obj.changedBy, obj.user)).toSet
        auth.getUserProfiles(ids).map {
          case Left(map) =>
            Ok(Json.toJson(r.map(log => CompleteObjectLog(log, map(log.changedBy), map(log.user)))))
          case Right(_) => InternalServerError
        }
      })
  }.requiresAuthentication

  def changeState(id: Int) = Action.async(parse.json) { req =>
    val targetState = (req.body \ "targetState").as[ObjectStatus.Value]
    val userId = (req.body \ "userId").as[Int]
    val adminId = req.user.userId
    val signature = (req.body \ "signature").asOpt[String]

    model.getOneComplete(id).flatMap {
      case Some(co) =>
        val requiresSignature = if (co.objectType.requiresSignature) targetState == ObjectStatus.InStock || targetState == ObjectStatus.Out else false

        if (requiresSignature && signature.isEmpty) {
          Future(BadRequest)
        } else {
          model.changeState(id, userId, adminId, targetState, signature).map(res => {
            if (res) Ok else BadRequest
          })
        }
      case None => Future(NotFound)
    }
  }.requiresAuthentication

  def getByTypeComplete(id: Int) = Action.async { req =>
    model.getAllByTypeComplete(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getByType(id: Int) = Action.async { req =>
    model.getAllByType(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getByLocation(id: Int) = Action.async { req =>
    model.getAllByLocation(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getByLocationComplete(id: Int) = Action.async { req =>
    model.getAllByLocationComplete(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getByLoanComplete(id: Int) = Action.async { req =>
    model.getAllByLoanComplete(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def createMultiple: Action[Array[SingleObject]] = Action.async(parse.json[Array[SingleObject]]) { req =>
    val tags = req.body.flatMap(obj => obj.assetTag)

    val existingTags = Future.foldLeft(tags.toList.map(tag => model.getOneByAssetTag(tag).map(opt => (opt, tag))))(List.empty[String])((lst, elem) => if (elem._1.isDefined) elem._2 :: lst else lst)

    existingTags.flatMap { existing =>
      val existingTagsSet = existing.toSet
      val (toInsert, notInserted) = req.body.partition(elem => elem.assetTag.isEmpty || !existingTagsSet(elem.assetTag.get))

      if (toInsert.nonEmpty) {
        model.insertAll(toInsert).map(res => (res zip toInsert)
          .map { case (id, obj) => obj.copy(objectId = Some(id)) })
          .map(inserted => Ok(Json.obj("inserted" -> inserted, "notInserted" -> notInserted)))
      } else {
        Future(Ok(Json.obj("inserted" -> List.empty[SingleObject], "notInserted" -> notInserted)))
      }
    }

  }.requiresAuthentication

  def updateOne(id: Int): Action[SingleObject] = Action.async(parse.json[SingleObject]) { req =>
    val tag = req.body.assetTag


    tag.map(model.getOneByAssetTag) match {
      case None => Future(BadRequest("Pas d'asset tag présent"))
      case Some(future) => future.flatMap {
        case Some(obj) if obj.objectId.get != id => Future(BadRequest("Asset tag déjà utilisé"))
        case _ =>
          model.updateOne(id, req.body).map(_ => Ok)
      }
    }
  }.requiresAuthentication

}
