package utils
import com.google.zxing.client.j2se.MatrixToImageWriter
import com.google.zxing.datamatrix.DataMatrixWriter
import com.google.zxing.oned.{CodaBarWriter, Code128Writer, Code39Writer}
import com.google.zxing.{BarcodeFormat, Writer}

import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.util.Base64
import javax.imageio.ImageIO

object BarcodeUtils {
  sealed abstract class AbstractBarcode(protected val writer: Writer, protected val format: BarcodeFormat) {
    val content: String

    private def imgToBytes(image: BufferedImage): Array[Byte] = {
      val out = new ByteArrayOutputStream()
      ImageIO.write(image, "png", out)

      out.toByteArray
    }

    private def imgToURI(image: BufferedImage): String =
      "data:image/png;base64," + Base64.getEncoder.encodeToString(imgToBytes(image))

    /**
     * Returns this code as a Base64 encoded image (for embedding)
     *
     * @param rotation
     * @param dpi
     */
    def codeToString(width: Int = 100, height: Int = 100): String = {
      imgToURI(codeToImage(width, height))
    }

    def codeToImage(width: Int = 100, height: Int = 100): BufferedImage = {
      val bitMatrix = writer.encode(content, format, width, height)

      MatrixToImageWriter.toBufferedImage(bitMatrix)
    }
  }

  case class Code128(override val content: String) extends AbstractBarcode(new Code128Writer, BarcodeFormat.CODE_128)


  case class Code39(override val content: String) extends AbstractBarcode(new Code39Writer, BarcodeFormat.CODE_39)

  case class Codabar(override val content: String) extends AbstractBarcode(new CodaBarWriter, BarcodeFormat.CODABAR)

  case class DataMatrix(override val content: String) extends AbstractBarcode(new DataMatrixWriter, BarcodeFormat.DATA_MATRIX)

}