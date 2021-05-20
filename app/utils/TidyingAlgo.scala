package utils

import data.{CompleteExternalLoan, CompleteObject, LoanStatus, StorageLocation}
import play.api.libs.json.{JsObject, Json}

import scala.collection.MapView

object TidyingAlgo {
  def compute(r: List[CompleteObject]): JsObject = {
    /*doCompute(r,
      _.inconvStorageLocationObject.map(Left(_)),
      o => o.partOfLoanObject.map(Right(_)).orElse(o.storageLocationObject.map(Left(_)))
    )*/ ???
  }

  def computeReversed(r: List[CompleteObject]): JsObject = {
    /*doCompute(r,
      o => o.partOfLoanObject.map(Right(_)).orElse(o.storageLocationObject.map(Left(_))),
      _.inconvStorageLocationObject.map(Left(_))
    )*/ ???
  }

  private def doCompute(r: List[CompleteObject], sourceMapper: CompleteObject => Option[Either[StorageLocation, CompleteExternalLoan]], targetMapper: CompleteObject => Option[Either[StorageLocation, CompleteExternalLoan]]) = {
    val objects =
    // Only the objects that are not in a loan or are in a non returned loan
      r.filterNot(elem => elem.partOfLoanObject.exists(_.externalLoan.status != LoanStatus.AwaitingReturn))

    def dropUselessValues(lst: List[CompleteObject]) =
      lst.map(_.copy(partOfLoanObject = None))

    def groupByTarget(objects: List[CompleteObject]) = {
      val (withTarget, unstored) = objects.partition(o => targetMapper(o).isDefined)

      val (groupedStored, groupedLoaned) = groupByExtractor[List[CompleteObject]](withTarget, targetMapper.andThen(_.get), dropUselessValues)
      val loaned = groupedLoaned.map { case (k, v) => Json.obj("loan" -> k, "objects" -> dropUselessValues(v)) }

      Json.obj(
        "stored" -> groupedStored,
        "loaned" -> loaned,
        "other" -> unstored
      )
    }

    def groupByExtractor[T](objects: List[CompleteObject], extract: CompleteObject => Either[StorageLocation, CompleteExternalLoan], transform: List[CompleteObject] => T): (MapView[String, MapView[String, MapView[String, T]]], MapView[CompleteExternalLoan, T]) = {
      val objectsWithSource = objects.map(o => (o, extract(o)))

      val (locations, loans) = objectsWithSource.partition(o => o._2.isLeft)

      val extractLoc: ((CompleteObject, Either[StorageLocation, CompleteExternalLoan])) => StorageLocation = _._2.left.toOption.get
      val extractLoan: ((CompleteObject, Either[StorageLocation, CompleteExternalLoan])) => CompleteExternalLoan = _._2.toOption.get

      val locMap = locations.groupBy(o => extractLoc(o).room)
        .view.mapValues(v => v.groupBy(o => extractLoc(o).space.getOrElse("Non Renseigné"))
        .view.mapValues(v => v.groupBy(o => extractLoc(o).location.getOrElse("Non Renseigné")).view
        .mapValues(_.map(_._1))
        .mapValues(transform)
      )
      )

      val loanMap = loans.groupBy(extractLoan).view
        .mapValues(_.map(_._1))
        .mapValues(transform)

      (locMap, loanMap)
    }

    val (stored, unstored) = objects.partition(obj => sourceMapper(obj).isDefined)

    val (storedLocation, loanedLocation) = groupByExtractor[JsObject](stored, sourceMapper.andThen(_.get), groupByTarget)
    val loaned = loanedLocation.map { case (k, v) => Json.obj("loan" -> k, "objects" -> v) }

    Json.obj("stored" -> storedLocation, "loaned" -> loaned, "unstored" -> groupByTarget(unstored))
  }
}
