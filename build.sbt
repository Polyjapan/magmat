name := "inventory"

version := "1.0"

lazy val `inventory` = (project in file(".")).enablePlugins(PlayScala)

resolvers += "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases"

resolvers += "Akka Snapshot Repository" at "https://repo.akka.io/snapshots/"

scalaVersion := "2.13.0"

libraryDependencies ++= Seq(jdbc, evolutions, ehcache, ws, specs2 % Test, guice)
libraryDependencies += "org.playframework.anorm" %% "anorm" % "2.6.4"
libraryDependencies += "com.typesafe.play" %% "play-json-joda" % "2.7.4"
libraryDependencies += "ch.japanimpact" %% "jiauthframework" % "0.2-SNAPSHOT"
libraryDependencies += "mysql" % "mysql-connector-java" % "5.1.34"
libraryDependencies += "com.pauldijou" %% "jwt-play" % "4.2.0"
unmanagedResourceDirectories in Test <+= baseDirectory(_ / "target/web/public/test")

      