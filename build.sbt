import sbt.Keys.{libraryDependencies, resolvers}

lazy val root = (project in file("."))
  .enablePlugins(PlayScala, JavaServerAppPackaging, DockerPlugin)
  .settings(
    name := "ji-inventory",
    version := "1.1",
    scalaVersion := "2.13.1",
    libraryDependencies ++= Seq(jdbc, evolutions, ehcache, ws, specs2 % Test, guice),

    libraryDependencies += "org.playframework.anorm" %% "anorm" % "2.6.4",
    libraryDependencies += "com.typesafe.play" %% "play-json" % "2.8.1",
    libraryDependencies += "com.typesafe.play" %% "play-json-joda" % "2.8.1",
    libraryDependencies += "ch.japanimpact" %% "jiauthframework" % "2.0.5",
    libraryDependencies += "ch.japanimpact" %% "ji-events-api" % "1.0-SNAPSHOT",
    libraryDependencies += "mysql" % "mysql-connector-java" % "5.1.34",
    libraryDependencies += "com.pauldijou" %% "jwt-play" % "4.2.0",

    resolvers += "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases",
    resolvers += "Japan Impact Snapshots" at "https://repository.japan-impact.ch/snapshots",
    resolvers += "Japan Impact Releases" at "https://repository.japan-impact.ch/releases",

    resolvers += "Akka Snapshot Repository" at "https://repo.akka.io/snapshots/",
    scalacOptions ++= Seq(
      "-feature",
      "-deprecation"
    ),


      javaOptions in Universal ++= Seq(
          // Provide the PID file
          s"-Dpidfile.path=/dev/null",
          // s"-Dpidfile.path=/run/${packageName.value}/play.pid",

          // Set the configuration to the production file
          s"-Dconfig.file=/etc/${packageName.value}/application.conf",

          // Apply DB evolutions automatically
          "-DapplyEvolutions.default=true"
      ),

      dockerExposedPorts := Seq(80),
      dockerUsername := Some("polyjapan"),
      dockerBaseImage := "openjdk:11",


      // Don't add the doc in the zip
      publishArtifact in(Compile, packageDoc) := false
  )

