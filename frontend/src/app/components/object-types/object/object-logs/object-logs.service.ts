import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { filter, map, repeatWhen, tap } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { ObjectLogWithUser } from "../../../../data/object-log";
import { Events, ObjectStatusChangeEvent, SseService } from "../../../../services/sse.service";
import { EventsService } from "../../../../services/stateful/events.service";

@Injectable({ providedIn: "root" })
export class ObjectLogsService {
  private refresh$: Observable<number>;

  constructor(private http: HttpClient, private sse: SseService, private events: EventsService) {
    this.refresh$ = this.sse.observe<ObjectStatusChangeEvent>(Events.ObjectStatusChange)
      .pipe(map(ev => ev.id))
  }

  getObjectLogs(objectId: number): Observable<ObjectLogWithUser[]> {
    return this.http.get<ObjectLogWithUser[]>(environment.apiurl + '/objects/logs/' + objectId)
      .pipe(repeatWhen(() => this.refresh$.pipe(filter(id => id === objectId))))
  }
}
