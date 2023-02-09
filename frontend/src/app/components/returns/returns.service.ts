import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { TidyingTree } from "../../data/tidying";
import { environment } from "../../../environments/environment";
import { Injectable } from "@angular/core";
import { CompleteObject } from "../../data/object";
import { switchMap } from "rxjs/operators";
import { ObjectsService } from "../../services/stateful/objects.service";

@Injectable({ providedIn: "root" })
export class ReturnsService {
  constructor(private http: HttpClient, private objects: ObjectsService) {}

  getObjectsInLoan(loan: number): Observable<CompleteObject[]> {
    return this.http.get<CompleteObject[]>(environment.apiurl + '/objects/by-loan/complete/' + loan)
      .pipe(switchMap((o) => this.objects.embedObjects(o)));
  }

}
