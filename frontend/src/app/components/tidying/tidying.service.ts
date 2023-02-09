import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { TidyingTree } from "../../data/tidying";
import { environment } from "../../../environments/environment";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class TidyingService {
  constructor(private http: HttpClient) {}

  getTidyingData(inverted: boolean, leftDepth: number, rightDepth: number): Observable<TidyingTree[]> {
    return this.http.get<TidyingTree[]>(environment.apiurl + '/objects/tidying?inverted=' + inverted + '&leftDepth=' + leftDepth + '&rightDepth=' + rightDepth);
  }
}
