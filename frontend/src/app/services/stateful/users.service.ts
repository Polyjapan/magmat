import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, merge, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { UserProfile } from '../../data/user';
import { RefreshAllService } from "../refresh-all.service";

@Injectable({ providedIn: 'root' })
export class UsersService {
  readonly refreshEvery = 60 * 60 * 1000

  readonly users$: Observable<UserProfile[]>;
  readonly usersById$: Observable<Map<number, UserProfile>>;

  constructor(private http: HttpClient, refreshAll: RefreshAllService) {
    this.users$ = merge(
      of(0), refreshAll.onRefreshAll, interval(this.refreshEvery)
    ).pipe(
      switchMap((_) => this.http.get<UserProfile[]>(environment.apiurl + '/people')),
      shareReplay(1)
    );

    this.usersById$ = this.users$.pipe(map(userList => {
        const map = new Map<number, UserProfile>();
        userList.forEach(us => map.set(us.id, us));
        return map;
      }),
      shareReplay(1)
    )
  }
}
