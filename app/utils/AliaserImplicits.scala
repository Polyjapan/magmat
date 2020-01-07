package utils

import anorm.{ColumnAliaser, ColumnName}

object AliaserImplicits {
  implicit class AliaserImplicit(aliaser: ColumnAliaser) {
    def debugging: ColumnAliaser = (column: (Int, ColumnName)) => {
      val intermediate = aliaser(column)
      println("Renamed column " + column + " to " + intermediate)
      intermediate
    }
  }
}
