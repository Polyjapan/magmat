import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { CompleteExternalLoan, ExternalLoan, LoanState } from '../../data/external-loan';
import { environment } from '../../../environments/environment';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';
import { EventsService } from './events.service';
import { Events, LoanChanged, SseService } from "../sse.service";

@Injectable({providedIn: 'root'})
export class LoansService {
  private readonly refreshEvery = 30 * 60 * 1000
  readonly loans$: Observable<CompleteExternalLoan[]>;
  private _loansMap$ = new ReplaySubject<Map<number, CompleteExternalLoan>>(1);
  readonly loansMap$ = this._loansMap$.asObservable()

  constructor(private http: HttpClient, events: EventsService, sse: SseService) {
    merge(
      of(0),
      interval(this.refreshEvery)
    ).pipe(
      switchMap(_ => events.currentEventId$),
      switchMap(evId => {
        const getParam = (evId ? '?eventId=' + evId : '');
        return this.http.get<CompleteExternalLoan[]>(environment.apiurl + '/external-loans' + getParam);
      }),
      map(loans => {
        const map = new Map<number, CompleteExternalLoan>();
        loans.forEach(loan => map.set(loan.externalLoan.externalLoanId, loan));
        return map;
      })
    ).subscribe(this._loansMap$);

    this.loans$ = this._loansMap$.pipe(map(loans => [...loans.values()]), shareReplay(1))

    // Auto updater subscription
    sse.observe<LoanChanged>(Events.LoanChanged).subscribe(async ({id, value}) => {
      const map = await this._loansMap$.pipe(take(1)).toPromise()
      const copy = new Map(map)
      copy.set(id, value)
      this._loansMap$.next(copy)
    })
  }

  getLoan(id: number): Observable<CompleteExternalLoan> {
    return this.loansMap$.pipe(map(loans => loans.get(id)));
  }

  changeState(loan: number, targetState: LoanState): Observable<void> {
    return this.http.put<void>(environment.apiurl + '/external-loans/' + loan + '/state',
      {targetState});
  }

  createLoan(loan: ExternalLoan): Observable<number> {
    return this.http.post<number>(environment.apiurl + '/external-loans', loan);
  }
}
