import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { CompleteObjectComment } from "../../../../data/object-comment";
import { filter, repeatWhen, tap } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { RefreshAllService } from "../../../../services/refresh-all.service";
import { environment } from "../../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class ObjectCommentsService {
  private refresh$ = new Subject<number>();

  constructor(private http: HttpClient, private refreshService: RefreshAllService) {
  }

  getObjectComments(objectId: number): Observable<CompleteObjectComment[]> {
    return this.http.get<CompleteObjectComment[]>(environment.apiurl + '/objects/comments/' + objectId)
      .pipe(
        repeatWhen(() => this.refresh$.pipe(filter(id => id === objectId))),
        repeatWhen(() => this.refreshService.onRefreshAll)
      )
  }

  postObjectComment(objectId: number, comment: string): Observable<void> {
    return this.http.post<void>(environment.apiurl + '/objects/comments/' + objectId, comment, { headers: { 'Content-Type': 'text/plain; charset=UTF-8' } })
      .pipe(tap(() => this.refresh$.next(objectId)));
  }
}
