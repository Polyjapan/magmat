import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CompleteObject, ObjectStatus } from "../data/object";
import { RefreshAllService } from "./refresh-all.service";
import { ObjectType } from "../data/object-type";
import { CompleteExternalLoan } from "../data/external-loan";

export type ObjectStatusChangeEvent = {
  id: number;
  newStatus: ObjectStatus,
  userId: number;
}

export type ObjectUpdatedEvent = {
  id: number;
  value: CompleteObject
}

export type ObjectTypeUpdated = {
  id: number;
  value: ObjectType;
}


export type LoanChanged = {
  id: number;
  value: CompleteExternalLoan;
}

export enum SSEStatus {
  DISCONNECTED, CONNECTING, CONNECTED, ERROR
}

export enum Events {
  ObjectStatusChange = 'ObjectStatusChange',
  ObjectUpdated = 'ObjectUpdated',
  ObjectTypeDeleted = 'ObjectTypeDeleted',
  ObjectTypeUpdated = 'ObjectTypeUpdated',
  LoanChanged = 'LoanChanged',
  StorageChanged = 'StorageChanged',
  StorageDeleted = 'StorageDeleted'
}

@Injectable({ providedIn: 'root' })
export class SseService {
  private status$: Subject<SSEStatus> = new BehaviorSubject<SSEStatus>(SSEStatus.DISCONNECTED);
  readonly status = this.status$.asObservable()
  private listeners: Partial<Record<Events, Subject<unknown>>> = {}
  private source: EventSource;

  constructor(private http: HttpClient, private auth: AuthService, private refresh: RefreshAllService) {
    this.connect()
  }

  observe<T>(event: Events): Observable<T> {
    if (!(event in this.listeners)) {
      this.listeners[event] = new Subject();
      this.addListener(event, this.listeners[event]);
    }

    return this.listeners[event]!.asObservable() as Observable<T>
  }

  private connect(reconnect: boolean = false) {
    const urlParams = new URLSearchParams({
      token: this.auth.rawToken
    })

    this.status$.next(SSEStatus.CONNECTING);
    this.source = new EventSource(`${environment.apiurl}/sse/subscribe?${urlParams.toString()}`)
    this.source.onerror = (err => {
      console.error('SSE failed.', err);
      this.status$.next(SSEStatus.ERROR);

      setTimeout(() => this.connect(true), 1000)
    })
    this.source.onopen = (msg => {
      console.info('SSE connection success', msg);
      this.status$.next(SSEStatus.CONNECTED);

      if (reconnect) {
        // We had lost the connection previously, we should refresh everything just in case we missed some changes
        this.refresh.refresh()
      }
    })

    // Readd all existing listeners
    Object.entries(this.listeners)
      .forEach(([event, listener]) => this.addListener(event as Events, listener))
  }

  private addListener(event: Events, listener: Subject<unknown>) {
    this.source.addEventListener(event, (e) => {
      // @ts-ignore
      listener.next(JSON.parse(e.data))
    })
  }

}
