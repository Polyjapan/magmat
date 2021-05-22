package controllers

import ch.japanimpact.auth.api.UserProfile
import data.{CompleteObjectComment, ObjectLogWithUser, ObjectStatus, SingleObject}
import models.{ObjectsModel, StorageModel, UsersModel}
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import utils.AuthenticationPostfix._
import utils.TidyingAlgo

import java.time.Clock
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

/**
 * @author Louis Vialar
 */
class ObjectsController @Inject()(cc: ControllerComponents, model: ObjectsModel, users: UsersModel, storage: StorageModel)(implicit ec: ExecutionContext, conf: Configuration, clock: Clock) extends AbstractController(cc) {
  def getAll = Action.async { req =>
    model.getAll.map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getAllComplete(room: Option[String] = None, space: Option[String] = None) = Action.async { req =>
    model.getAllComplete(room, space).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def computeTidying(inverted: Option[Boolean], leftDepth: Option[Int], rightDepth: Option[Int]) = Action.async { req =>
    model.getAllComplete().flatMap(r => {
      storage.getAll.map(stor => {
        val data = TidyingAlgo.buildList(r, stor)

        Ok apply Json.toJson {
          if (inverted.getOrElse(false))
            TidyingAlgo.fromStorageToConv(data, leftDepth.getOrElse(-1), rightDepth.getOrElse(-1))
          else
            TidyingAlgo.fromConvToStorage(data, leftDepth.getOrElse(-1), rightDepth.getOrElse(-1))
        }(TidyingAlgo.resultWriter)
      })

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

  def getNextSuffix(typeId: Int, prefix: Option[String]) = Action.async { req =>
    model.getAllByType(typeId).map(objects => {
      val lcPrefix = prefix.getOrElse("").toLowerCase()
      val lcPrefixLen = lcPrefix.length

      if (lcPrefixLen == 0) 1
      else {
        val filteredNums = objects
          .map(obj => obj.suffix.toLowerCase())
          .filter(_.startsWith(lcPrefix))
          .map(_.drop(lcPrefixLen))
          .map(_.trim)
          .filter(_.forall(_.isDigit))
          .map(_.toInt)

        if (filteredNums.isEmpty) 1 else filteredNums.max + 1
      }
    }).map(n => Ok(Json.toJson(n)))
  }.requiresAuthentication

  def getOneComplete(id: Int) = Action.async { req =>
    model.getOneComplete(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getOne(id: Int) = Action.async { req =>
    model.getOne(id).map(r => Ok(Json.toJson(r)))
  }.requiresAuthentication

  def getLogs(id: Int): Action[AnyContent] = Action.async { req =>
    model.getLogs(req.eventId, id)
      .flatMap(r => {
        val ids: Set[Int] = r.flatMap(obj => Set(obj.objectLog.changedBy) ++ obj.objectLog.user.toSet).toSet
        users.getUsersWithIds(ids).map {
          case Right(map) =>
            Ok(Json.toJson(r.map(log => log.copy(
              changedBy = map.unapply(log.objectLog.changedBy),
              user = log.objectLog.user.flatMap(uId => map.unapply(uId))))))
          case Left(_) => InternalServerError
        }
      })
  }.requiresAuthentication

  def getComments(id: Int) = Action.async { req =>
    model.getComments(req.eventId, id)
      .flatMap(r => {
        val ids: Set[Int] = r.map(_.writer).toSet
        users.getUsersWithIds(ids).map {
          case Right(map) => Ok(Json.toJson(r.map(com => CompleteObjectComment(com, map(com.writer)))))
          case Left(_) => InternalServerError
        }
      })
  }.requiresAuthentication

  def postComment(id: Int): Action[String] = Action.async(parse.text(5000)) { req =>
    if (req.body.nonEmpty) {
      model.addComment(req.eventId, id, req.user.userId, req.body).map(_ => Ok)
    }
    else Future(BadRequest)
  }

  def changeState(id: Int) = Action.async(parse.json) { req =>
    val targetState = (req.body \ "targetState").as[ObjectStatus.Value]
    val userId = (req.body \ "userId").as[Int]
    val adminId = req.user.userId
    val signature = (req.body \ "signature").asOpt[String]

    model.getOneComplete(id).flatMap {
      case Some(co) =>
        val requiresSignature = if (co.`object`.requiresSignature) (co.`object`.status == ObjectStatus.InStock || co.`object`.status == ObjectStatus.Out) && targetState == ObjectStatus.Out else false

        if (requiresSignature && signature.isEmpty) {
          Future(BadRequest)
        } else {
          model.changeState(req.eventId, id, userId, adminId, targetState, signature).map(res => {
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

  def getLoanedTo(id: Int) = Action.async { rq =>
    model.getObjectsLoanedTo(id).map(lst => Ok(Json.toJson(lst)))
  }.requiresAuthentication

  def getLoaned = Action.async { rq =>
    model.getObjectsLoaned.flatMap(objs => {
      users.getUsersWithIds(objs.map(_._2).toSet)
        .map {
          case Right(users) =>
            Ok(Json.toJson(
              objs.map { case (obj, uid) => Json.obj("object" -> obj, "user" -> users(uid)) }
            ))
          case _ => InternalServerError
        }
    })
  }.requiresAuthentication

  def getUserHistory(id: Int) = Action.async { rq =>
    model.getUserHistory(rq.eventId, id).map(lst => Ok(Json.toJson(lst)))
  }.requiresAuthentication
}
