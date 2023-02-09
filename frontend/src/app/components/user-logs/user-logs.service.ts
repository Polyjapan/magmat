import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { TidyingTree } from "../../data/tidying";
import { environment } from "../../../environments/environment";
import { CompleteObject } from "../../data/object";
import { switchMap } from "rxjs/operators";
import { ObjectLogWithObject } from "../../data/object-log";
import { ObjectsService } from "../../services/stateful/objects.service";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class UserLogsService {
  constructor(private http: HttpClient, private objects: ObjectsService) {}
  getObjectsLoanedToUser(userId: number): Observable<CompleteObject[]> {
    return this.http.get<CompleteObject[]>(environment.apiurl + '/objects/loanedTo/' + userId)
      .pipe(switchMap((o) => this.objects.embedObjects(o)));
  }

  getLoansHistoryForUser(userId: number): Observable<ObjectLogWithObject[]> {
    return this.http.get<ObjectLogWithObject[]>(environment.apiurl + '/objects/history/' + userId);
  }

}
