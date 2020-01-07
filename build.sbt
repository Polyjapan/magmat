import sbt.Keys.{libraryDependencies, resolvers}

lazy val root = (project in file("."))
  .enablePlugins(PlayScala)
  .settings(
    name := "ji-inventory",
    version := "1.0-SNAPSHOT",
    scalaVersion := "2.13.1",
    libraryDependencies ++= Seq(jdbc, evolutions, ehcache, ws, specs2 % Test, guice),

    libraryDependencies += "org.playframework.anorm" %% "anorm" % "2.6.4",
    libraryDependencies += "com.typesafe.play" %% "play-json" % "2.8.1",
    libraryDependencies += "com.typesafe.play" %% "play-json-joda" % "2.8.1",
    libraryDependencies += "ch.japanimpact" %% "jiauthframework" % "0.2-SNAPSHOT",
    libraryDependencies += "mysql" % "mysql-connector-java" % "5.1.34",
    libraryDependencies += "com.pauldijou" %% "jwt-play" % "4.2.0",

    resolvers += "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases",

    resolvers += "Akka Snapshot Repository" at "https://repo.akka.io/snapshots/",
    scalacOptions ++= Seq(
      "-feature",
      "-deprecation"
    )
  )

