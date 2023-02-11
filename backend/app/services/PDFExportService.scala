package services

import com.hhandoko.play.pdf.PdfGenerator
import data.CompleteObject
import services.PDFExportService.ObjectLine
import utils.BarcodeUtils.Code128

import javax.inject.Inject

object PDFExportService {
  case class ObjectLine(assetTag: String, name: String, barcodeUri: String)
}

class PDFExportService @Inject()(pdfGen: PdfGenerator) {

  def exportObjects(title: String, titleBarcode: Option[String], objects: List[CompleteObject]) = {
    val lines = objects.map(obj => {
      ObjectLine(obj.`object`.assetTag.getOrElse("no_tag"),
        obj.objectType.name + " " + obj.`object`.suffix,
        Code128(obj.`object`.assetTag.getOrElse("no_tag")).codeToString(200, 50))
    })

    pdfGen.toBytes(
      views.html.`export`(title, titleBarcode.map(e => Code128(e).codeToString()), lines),
      "export.pdf",
      Seq()
    )
  }

}
