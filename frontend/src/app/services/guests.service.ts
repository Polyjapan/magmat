import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {Guest} from '../data/guest';

@Injectable({providedIn: 'root'})
export class GuestsService {
  private refresh$ = new BehaviorSubject(0);
  private guests$: Observable<Guest[]>;
  private lastPull = 0;

  constructor(private http: HttpClient) {
    this.guests$ = this.refresh$.pipe(
      switchMap((_) => this.http.get<Guest[]>(environment.apiurl + '/guests/')),
      shareReplay(1)
    );
  }

  refreshGuests() {
    this.lastPull = Date.now();
    this.refresh$.next(0);
  }

  getGuests(): Observable<Guest[]> {
    this.pullIfNeeded();
    return this.guests$;
  }

  getGuest(id: number): Observable<Guest> {
    this.pullIfNeeded();

    return this.guests$.pipe(map(lenders => lenders.filter(lender => lender.guestId === id)[0]));
  }

  createGuest(lender: Guest): Observable<number> {
    return this.http.post<number>(environment.apiurl + '/guests/', lender);
  }

  private pullIfNeeded() {
    const now = Date.now();

    if (now - this.lastPull > (60 * 1000)) {
      this.refreshGuests();
    }
  }
}
