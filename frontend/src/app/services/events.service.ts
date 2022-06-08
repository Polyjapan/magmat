import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Event} from '../data/event';
import {AuthService} from './auth.service';
import {catchError, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {LoginResponse} from './login.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {of} from 'rxjs/internal/observable/of';
import {Option} from '@angular/cli/models/interface';

@Injectable({providedIn: 'root'})
export class EventsService {
  private refresh$ = new BehaviorSubject(0);
  private event$: Observable<Event>;
  private events$: Observable<Event[]>;

  constructor(private http: HttpClient, private auth: AuthService) {
    this.events$ = this.http.get<Event[]>(environment.apiurl + '/events')
      .pipe(shareReplay({bufferSize: 1, refCount: true}));

    this.event$ = this.refresh$.pipe(
      tap(_ => console.log("reloading...")),
      switchMap((_) => this.http.get<Event>(environment.apiurl + '/events/current').pipe(catchError(err => of(null)))),
      tap(_ => console.log("got event...")),
      shareReplay(1));
  }

  getCurrentEvent(): Observable<Event> {
    return this.event$;
  }

  getCurrentEventId(): Observable<number | null> {
    return this.event$.pipe(map(ev => ev?.id))
  }

  getEvents(): Observable<Event[]> {
    return this.events$;
  }

  switchEvent(id: number): Observable<void> {
    localStorage.setItem('current_event_id', id ? id.toString(10) : '0');

    return this.http.get<LoginResponse>(environment.apiurl + '/events/switch/' + id)
      .pipe(
        tap(res => {
          this.auth.changeToken(res.session);
          this.refresh$.next(Date.now());
        }),
        map(res => undefined)
      );
  }
}
