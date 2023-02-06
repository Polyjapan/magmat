package models

import ch.japanimpact.api.events.EventsService
import ch.japanimpact.api.events.events.{SimpleEvent, Visibility}
import play.api.Logger
import play.api.cache.SyncCacheApi

import javax.inject.{Inject, Singleton}
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext, Future}

@Singleton
class EventsModel @Inject()(cache: SyncCacheApi, service: EventsService)(implicit ec: ExecutionContext) {
  def getCurrentEvent: Future[SimpleEvent] =
    cache.getOrElseUpdate("current_event", 30.minutes) {
      service.getCurrentEvent(visibility = Some(Visibility.Internal)).map {
        case Left(err) =>
          Logger("EventsModel").error("API Error while getting current event: " + err.error + " ; " + err.errorMessage)
          throw new Exception("API Error " + err.error)
        case Right(event) =>
          event.event
      }
    }

  def getEvent(eventId: Int): Future[SimpleEvent] = service.getEvent(eventId).map {
    case Left(err) =>
      Logger("EventsModel").error("API Error while getting event " + eventId + ": " + err.error + " ; " + err.errorMessage)
      throw new Exception("API Error " + err.error)
    case Right(ev) => ev.event
  }

  def getEvents: Future[List[SimpleEvent]] = service.getEvents().map {
    case Left(err) =>
      Logger("EventsModel").error("API Error while getting list of events: " + err.error + " ; " + err.errorMessage)
      throw new Exception("API Error " + err.error)
    case Right(lst) =>
      lst.map(_.event).filter(e => e.visibility != Visibility.Draft).toList
  }
}
