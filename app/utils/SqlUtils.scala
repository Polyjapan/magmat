package utils

import java.sql.Connection

import anorm.Macro.ColumnNaming
import anorm.SqlParser.scalar
import anorm.{NamedParameter, SQL, ToParameterList}

object SqlUtils {
  /**
   * Inserts one item in the given table and returns its id
   * @param table the table in which the item shall be inserted
   * @param item the item that shall be inserted
   * @return the id of the inserted item
   */
  def insertOne[T](table: String, item: T)(implicit parameterList: ToParameterList[T], conn: Connection): Int = {
    insertOneNoId(table, item).get
  }

  def insertOneNoId[T](table: String, item: T)(implicit parameterList: ToParameterList[T], conn: Connection): Option[Int] = {

    val params: Seq[NamedParameter] = parameterList(item);
    val names: List[String] = params.map(_.name).toList
    val colNames = names.map(ColumnNaming.SnakeCase) mkString ", "
    val placeholders = names.map { n => s"{$n}" } mkString ", "

    SQL("INSERT INTO " + table + "(" + colNames +") VALUES (" + placeholders + ")")
      .bind(item)
      .executeInsert(scalar[Int].singleOpt)
  }
}
