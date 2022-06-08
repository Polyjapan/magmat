import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {UserProfile} from '../data/user';

@Injectable({providedIn: 'root'})
export class ProfileService {
  constructor(private http: HttpClient) {
  }

  getUserProfile(input: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(environment.apiurl + '/people/' + input);
  }

  searchUsers(input: string): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(environment.apiurl + '/people/search/' + input);
  }

  getUser(id: number): Observable<UserProfile> {
    return this.getUserProfile('' + id);
  }
}
