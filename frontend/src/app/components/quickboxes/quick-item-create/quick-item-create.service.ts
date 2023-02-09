import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class QuickItemCreateService {
  constructor(private readonly http: HttpClient) {
  }

  getNextSuffix(typeId: number, prefix: string): Promise<number> {
    return this.http
      .get<number>(environment.apiurl + '/objects/nextSuffix/' + typeId + '?prefix=' + prefix)
      .pipe(take(1))
      .toPromise();
  }
}
