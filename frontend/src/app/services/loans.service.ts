import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AsyncSubject, BehaviorSubject, Observable} from 'rxjs';
import {CompleteExternalLoan, ExternalLoan, LoanState} from '../data/external-loan';
import {environment} from '../../environments/environment';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {EventsService} from './events.service';

@Injectable({providedIn: 'root'})
export class LoansService {
  private refresh$ = new BehaviorSubject(0);
  private loans$: Observable<CompleteExternalLoan[]>; // = new BehaviorSubject<CompleteExternalLoan[]>([]);
  private loansMap$: Observable<Map<number, CompleteExternalLoan>>; // = new BehaviorSubject<CompleteExternalLoan[]>([]);
  private lastPull = 0;

  constructor(private http: HttpClient, events: EventsService) {
    const refresh = this.refresh$.pipe(switchMap(_ => events.getCurrentEventId()));

    this.loans$ = refresh.pipe(
      switchMap(evId => {
        const getParam = (evId ? '?eventId=' + evId : '');
        return this.http.get<CompleteExternalLoan[]>(environment.apiurl + '/external-loans' + getParam);
      }),
      shareReplay(1)
    );

    this.loansMap$ = this.loans$.pipe(map(loans => {
      const map = new Map<number, CompleteExternalLoan>();
      loans.forEach(loan => map.set(loan.externalLoan.externalLoanId, loan));
      return map;
    }))
  }

  forceRefreshLoans() {
    this.lastPull = 0;
    this.pullIfNeeded();
  }

  getLoans(): Observable<CompleteExternalLoan[]> {
    this.pullIfNeeded();
    return this.loans$;
  }

  getLoansMap(): Observable<Map<number, CompleteExternalLoan>> {
    this.pullIfNeeded();
    return this.loansMap$;
  }

  getLoan(id: number): Observable<CompleteExternalLoan> {
    return this.getLoansMap().pipe(map(loans => loans.get(id)));
  }

  changeState(loan: number, targetState: LoanState): Observable<void> {
    return this.http.put<void>(environment.apiurl + '/external-loans/' + loan + '/state',
      {targetState});
  }

  createLoan(loan: ExternalLoan): Observable<number> {
    return this.http.post<number>(environment.apiurl + '/external-loans', loan);
  }

  private pullIfNeeded() {
    const now = Date.now();


    if (now - this.lastPull > (60 * 1000)) {
      this.refresh$.next(now);
      this.lastPull = now;
    }
  }
}
