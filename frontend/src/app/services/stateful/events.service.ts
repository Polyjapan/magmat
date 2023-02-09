import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Event } from '../../data/event';
import { AuthService } from '../auth.service';
import { map, retry, shareReplay, switchMap, tap } from 'rxjs/operators';
import { LoginResponse } from '../login.service';
import { interval, merge, Observable, of, Subject } from 'rxjs';
import { RefreshAllService } from "../refresh-all.service";

@Injectable({ providedIn: 'root' })
export class EventsService {
  readonly refreshEvery = 60 * 60 * 1000
  readonly currentEvent$: Observable<Event>;
  readonly events$: Observable<Event[]>;
  readonly currentEventId$: Observable<number | undefined>;
  private refreshCurrent$ = new Subject<void>()

  constructor(private http: HttpClient, private auth: AuthService, private refresh: RefreshAllService) {
    this.events$ = merge(of(0), interval(this.refreshEvery), this.refresh.onRefreshAll)
      .pipe(
        switchMap(() => this.http.get<Event[]>(environment.apiurl + '/events')),
        retry(5),
        shareReplay(1)
      )

    this.currentEvent$ = merge(of(0), interval(this.refreshEvery), this.refresh.onRefreshAll, this.refreshCurrent$)
      .pipe(
        switchMap((_) => this.http.get<Event>(environment.apiurl + '/events/current')),
        retry(5),
        shareReplay(1)
      );

    this.currentEventId$ = this.currentEvent$.pipe(map(ev => ev?.id))
  }

  switchEvent(id: number): Observable<void> {
    localStorage.setItem('current_event_id', id ? id.toString(10) : '0');

    return this.http.get<LoginResponse>(environment.apiurl + '/events/switch/' + id)
      .pipe(
        tap(res => {
          this.auth.changeToken(res.session);
          this.refreshCurrent$.next();
        }),
        map(res => undefined)
      );
  }
}
