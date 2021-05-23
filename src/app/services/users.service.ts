import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {Guest} from '../data/guest';
import {UserProfile} from '../data/user';

@Injectable({providedIn: 'root'})
export class UsersService {
  private refresh$ = new BehaviorSubject(0);
  private users$: Observable<UserProfile[]>;
  private usersById$: Observable<Map<number, UserProfile>>;
  private usersByStaffNumber$: Observable<Map<number, UserProfile>>;
  private lastPull = 0;

  constructor(private http: HttpClient) {
    this.users$ = this.refresh$.pipe(
      switchMap((_) => this.http.get<UserProfile[]>(environment.apiurl + '/people')),
      shareReplay(1)
    );

    this.usersById$ = this.users$.pipe(map(userList => {
      const map = new Map<number, UserProfile>();
      userList.forEach(us => map.set(us.id, us));
      return map;
    }))

    this.usersByStaffNumber$ = this.users$.pipe(map(userList => {
      const map = new Map<number, UserProfile>();
      userList.filter(us => us.staffNumber).forEach(us => map.set(us.staffNumber, us));
      return map;
    }))
  }

  refresj() {
    this.lastPull = Date.now();
    this.refresh$.next(0);
  }

  getUsers(): Observable<UserProfile[]> {
    this.pullIfNeeded();
    return this.users$;
  }

  getUsersMap(): Observable<Map<number, UserProfile>> {
    this.pullIfNeeded();
    return this.usersById$;
  }

  getUser(id: number): Observable<UserProfile> {
    this.pullIfNeeded();

    return this.usersById$.pipe(map(um => um.get(id)));
  }

  getStaff(id: number): Observable<UserProfile> {
    this.pullIfNeeded();

    return this.usersByStaffNumber$.pipe(map(um => um.get(id)));
  }

  private pullIfNeeded() {
    const now = Date.now();

    if (now - this.lastPull > (60 * 1000)) {
      this.refresj();
    }
  }
}
