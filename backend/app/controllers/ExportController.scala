package controllers

import models.{ObjectsModel, StorageModel}
import play.api.Configuration
import play.api.mvc.{AbstractController, ControllerComponents}
import services.PDFExportService
import utils.AuthenticationPostfix.AuthenticationPostfix

import java.time.Clock
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

class ExportController @Inject()(cc: ControllerComponents, pdf: PDFExportService, storages: StorageModel, objects: ObjectsModel)(implicit ec: ExecutionContext, config: Configuration, clock: Clock) extends AbstractController(cc) {

  def exportStorage(storageId: Int) = Action.async {
    storages.getOne(storageId) flatMap { case Some(storage) => objects.getAllByLocationComplete(storageId) map { objects =>
      val generatedFile = pdf.exportObjects(s"Stockage: ${storage.storageName}", None, objects)

      Ok(generatedFile).as("application/pdf")
    }
    case None => Future(NotFound)
    }
  }.requiresAuthentication

  def exportType(typeId: Int) = Action.async {
    objects.getAllByTypeComplete(typeId) map {
      case Nil => NotFound
      case head :: tail =>

        val generatedFile = pdf.exportObjects(s"Catégorie: ${head.objectType.name}", None, head :: tail)

        Ok(generatedFile).as("application/pdf")
    }
  }.requiresAuthentication

  def exportAll() = Action.async {
    objects.getAllComplete(None) map { lst =>
        val generatedFile = pdf.exportObjects(s"Tous les objets", None, lst)

        Ok(generatedFile).as("application/pdf")
    }
  }.requiresAuthentication

}
