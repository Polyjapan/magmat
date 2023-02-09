package services

import akka.actor.{Actor, ActorSystem, Props}
import akka.stream.{BoundedSourceQueue, Materializer, QueueOfferResult}
import akka.stream.scaladsl.Source
import ch.japanimpact.auth.api.UserProfile
import com.google.inject.{Inject, Singleton}
import data.{CompleteExternalLoan, CompleteObject, ObjectStatus, ObjectType, Storage}
import data.ObjectStatus.ObjectStatus
import models.ObjectsModel
import play.api.{Logger, Logging}
import play.api.Play.materializer
import play.api.libs.EventSource.{EventDataExtractor, EventNameExtractor}
import play.api.libs.json.{JsNull, JsValue, Json, Writes}
import services.SSEService.SSEActor.{Send, Subscribe, Unsubscribe, props}
import services.SSEService.{KeepAlive, ObjectUpdated, SSEActor, SSEEvent}

import java.util.UUID
import scala.concurrent.ExecutionContext
import scala.concurrent.duration.DurationInt

@Singleton()
class SSEService @Inject()(system: ActorSystem, objects: ObjectsModel)(implicit materializer: Materializer, ec: ExecutionContext) extends Logging {
  private val sseActor = system.actorOf(SSEActor.props, "sse-actor")

  def subscribe: Source[SSEEvent, _] = {
    val id = UUID.randomUUID()
    val (queue, newSource) = Source.queue[SSEEvent](1)
      .preMaterialize()

    sseActor ! SSEActor.Subscribe(id, queue)
    newSource
  }

  initKeepalive()

  def send(event: SSEEvent): Unit = {
    sseActor ! SSEActor.Send(event)
  }

  def notifyObjectChanged(id: Int, eventId: Option[Int]): Unit = {
    this.objects.getOneComplete(id, eventId)
      .foreach {
        case Some(obj) =>
          send(ObjectUpdated(obj.`object`.objectId.get, obj))
        case None =>
      }
  }

  private def initKeepalive(): Unit = {
    val keepAlive = Source.tick(5.seconds, 5.seconds, KeepAlive())
    keepAlive.runForeach((ke) => {
      sseActor ! Send(ke)
    }).onComplete {
      _ =>
        logger.warn("Keepalive source crashed, restarting")
        initKeepalive()
    }
  }
}


object SSEService {

  sealed trait SSEEvent

  class SSEActor extends Actor with Logging {

    import SSEActor._

    private def update(state: SSEActorState): Unit = {
      context.become(receive(state))
    }

    def receive(state: SSEActorState = SSEActorState(Map())): Actor.Receive = {
      case Subscribe(id, queue) =>
        update(state.copy(subscribers = state.subscribers.updated(id, queue)))
      case Unsubscribe(id) =>
        update(state.copy(subscribers = state.subscribers - id))
      case Send(event) =>
        val toDrop = state.subscribers
          .map {
            case (id, elem) => id -> elem.offer(event)
          }
          .filter(pair => pair._2 != QueueOfferResult.Enqueued)
          .keySet

        if (toDrop.nonEmpty) {
          logger.warn("Following subscriptions terminated: " + toDrop)
          update(state.copy(subscribers = state.subscribers -- toDrop))
        }
    }

    override def receive: Receive = receive()
  }


  case class ObjectUpdated(id: Int, value: CompleteObject) extends SSEEvent
  case class ObjectTypeUpdated(id: Int, value: ObjectType) extends SSEEvent
  case class ObjectTypeDeleted(id: Int) extends SSEEvent
  case class StorageUpdated(id: Int, value: Storage) extends SSEEvent
  case class StorageDeleted(id: Int) extends SSEEvent
  case class ObjectStatusChange(id: Int, newStatus: ObjectStatus.Value, userId: Int) extends SSEEvent
  case class LoanChanged(id: Int, value: CompleteExternalLoan) extends SSEEvent
  case class KeepAlive() extends SSEEvent

  object SSEActor {
    def props = Props[SSEActor]

    sealed trait SSEActorAction

    case class SSEActorState(subscribers: Map[UUID, BoundedSourceQueue[SSEEvent]])

    case class Subscribe(id: UUID, queue: BoundedSourceQueue[SSEEvent]) extends SSEActorAction

    case class Unsubscribe(id: UUID) extends SSEActorAction

    case class Send(event: SSEEvent) extends SSEActorAction
  }


  implicit val keepAliveEvent: Writes[KeepAlive] = (o: KeepAlive) => JsNull
  implicit val objectStatusChangeEvent: Writes[ObjectStatusChange] = Json.writes[ObjectStatusChange]
  implicit val objectUpdatedEvent: Writes[ObjectUpdated] = Json.writes[ObjectUpdated]
  implicit val objectTypeUpdatedEvent: Writes[ObjectTypeUpdated] = Json.writes[ObjectTypeUpdated]
  implicit val objectTypeDeletedEvent: Writes[ObjectTypeDeleted] = Json.writes[ObjectTypeDeleted]
  implicit val storageUpdatedEvent: Writes[StorageUpdated] = Json.writes[StorageUpdated]
  implicit val storageDeletedEvent: Writes[StorageDeleted] = Json.writes[StorageDeleted]
  implicit val loanChangedEvent: Writes[LoanChanged] = Json.writes[LoanChanged]

  implicit val format: Writes[SSEEvent] = Json.writes[SSEEvent]

  implicit val nameExtractor: EventNameExtractor[SSEEvent] =
    EventNameExtractor((e: SSEEvent) => Some(e.getClass.getSimpleName))

  implicit val contentExtractor: EventDataExtractor[SSEEvent] = EventDataExtractor(e => Json.stringify(Json.toJson(e)))
}