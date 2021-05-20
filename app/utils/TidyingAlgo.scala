package utils

import data.{CompleteExternalLoan, CompleteObject, SingleObject, Storage, StorageTree}
import play.api.libs.json._

object TidyingAlgo {
  type StorageOrLoan = Option[Either[StorageTree, CompleteExternalLoan]]

  case class RecStorageTree[T](map: Map[StorageOrLoan, Either[T, RecStorageTree[T]]])

  private type insideStorageTreeType = RecStorageTree[List[SingleObject]]

  private implicit val insideWriter: Writes[RecStorageTree[List[SingleObject]]] = writer[List[SingleObject]]
  implicit val resultWriter: Writes[RecStorageTree[RecStorageTree[List[SingleObject]]]] = writer[RecStorageTree[List[SingleObject]]]

  implicit def writer[T](implicit tWriter: Writes[T]): Writes[RecStorageTree[T]] = new Writes[RecStorageTree[T]] {
    override def writes(o: RecStorageTree[T]): JsValue = JsArray(o.map.toList.map {
      case (storageOrLoan: StorageOrLoan, next) =>
        val base: Option[(String, JsObject)] = storageOrLoan.map {
          case Left(storageTree) => "storage" -> Json.toJsObject(storageTree)
          case Right(completeExternalLoan) => "loan" -> Json.toJsObject(completeExternalLoan)
        } // .getOrElse(Json.obj("type" -> JsString("none")))

        val (contentType, content) = next match {
          case Left(value) => "leaf" -> tWriter.writes(value)
          case Right(rec) => "node" -> writes(rec)
        }

        val data = Json.obj(contentType -> content)

        base match {
          case Some((tag, value)) => data + (tag -> value)
          case None => data
        }
    })
  }


  def build(lst: List[ObjectWithLocationInfo], leftMapper: ObjectWithLocationInfo => StorageOrLoan, rightMapper: ObjectWithLocationInfo => StorageOrLoan)(maxDepthLeft: Int = -1, maxDepthRight: Int = -1): RecStorageTree[RecStorageTree[List[SingleObject]]] =
    buildStorageTree(lst, leftMapper, inCategory => buildStorageTree(inCategory, rightMapper, _.map(_.`object`), depth = maxDepthRight), depth = maxDepthLeft)

  def fromConvToStorage(lst: List[ObjectWithLocationInfo], maxDepthLeft: Int = -1, maxDepthRight: Int = -1): RecStorageTree[RecStorageTree[List[SingleObject]]] =
    build(lst, _.conv.map(e => Left(e)), _.origin)(maxDepthLeft, maxDepthRight)

  def fromStorageToConv(lst: List[ObjectWithLocationInfo], maxDepthLeft: Int = -1, maxDepthRight: Int = -1): RecStorageTree[RecStorageTree[List[SingleObject]]] =
    build(lst, _.origin, _.conv.map(e => Left(e)))(maxDepthLeft, maxDepthRight)

  def buildList(r: List[CompleteObject], allStorages: List[data.Storage]): List[ObjectWithLocationInfo] = {
    val map = allStorages.map(e => e.storageId.get -> e).toMap

    def buildAncestry(storage: Storage): List[Storage] = {
      val parentAncestry = storage.parentStorageId.map(map).map(buildAncestry).getOrElse(List())
      storage :: parentAncestry
    }

    def buildTree(ancestors: List[Storage], child: Option[StorageTree] = None): StorageTree = ancestors match {
      case node :: parents =>
        val tree = StorageTree(node.storageId, node.parentStorageId, child.toList, node.storageName, node.event)

        if (parents.isEmpty) tree
        else buildTree(parents, Some(tree))
    }

    val trees = map.view
      .mapValues(buildAncestry)
      .mapValues(lst => buildTree(lst))

    r map { obj =>
      ObjectWithLocationInfo(obj.`object`.copy(suffix = obj.objectType.name + " " + obj.`object`.suffix), // helper for the client
        obj.partOfLoanObject.map(e => Right(e)).orElse(obj.`object`.storageLocation.orElse(obj.objectType.storageLocation).map(trees).map(t => Left(t))),
        obj.`object`.inconvStorageLocation.orElse(obj.objectType.inconvStorageLocation).map(trees)
      )
    }
  }


  private def buildStorageTree[T](r: List[ObjectWithLocationInfo], locMapper: ObjectWithLocationInfo => StorageOrLoan, transformer: List[ObjectWithLocationInfo] => T, root: Option[StorageTree] = None, depth: Int = -1): RecStorageTree[T] = {
    def locExtractor(loc: StorageOrLoan): StorageOrLoan = {
      if (root.isEmpty) loc.map(_.left.map(_.copy(children = List.empty)))
      else {
        loc.flatMap {
          case Left(location) =>
            var node: Option[StorageTree] = Some(location)
            while (node.isDefined && node.get.storageId.get != root.get.storageId.get) node = node.get.children.headOption

            node.flatMap(_.children.headOption).map(res => Left(res.copy(children = List.empty))) // get first child
          case right => Some(right)
        }
      }
    }

    val ret = RecStorageTree(r.groupBy(locMapper.andThen(locExtractor)).map {
      case (n@None, lst) => (n, Left(transformer(lst)))
      case (s@Some(Left(loc)), lst) if depth != 0 => (s, Right(buildStorageTree(lst, locMapper, transformer, Some(loc), depth - 1)))
      case (s, lst) => (s, Left(transformer(lst)))
    })

    ret
  }

  case class ObjectWithLocationInfo(`object`: SingleObject, origin: StorageOrLoan, conv: Option[StorageTree])
}
