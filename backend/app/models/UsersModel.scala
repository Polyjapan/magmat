package models

import ch.japanimpact.api.APIError
import ch.japanimpact.auth.api.{UserData, UserProfile, UsersApi}

import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}
import scala.language.implicitConversions

class UsersModel @Inject()(val usersApi: UsersApi)(implicit val ec: ExecutionContext) {
  implicit class UserDataConversion(data: UserData) {
    def asUserProfile: UserProfile =
      UserProfile(data.id.get, data.email, data.details, data.address)
  }

  def getUsersWithIds(ids: Set[Int]): Future[Either[APIError, PartialFunction[Int, UserProfile]]] = {
    usersApi.getUsersWithIds(ids) map { either =>
      either map { partFun => partFun.andThen(_.asUserProfile) }
    }
  }

  def getUserWithId(id: Int): Future[Either[APIError, UserProfile]] = {
    usersApi.user(id).get map { either => either map { data => data.asUserProfile } }
  }

  def searchUsers(query: String): Future[Either[APIError, Seq[UserProfile]]] = {
    usersApi.searchUsers(query).map(_.map(_.take(10)))
  }

  def getAllUsers: Future[Either[APIError, Iterable[UserProfile]]] = usersApi.getUsers

}
