import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {UserProfile} from '../../../data/user';

@Injectable({providedIn: 'root'})
export class ViewUserService {
  constructor(private http: HttpClient) {
  }

  getUser(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(environment.apiurl + '/people/' + id);
  }
}
