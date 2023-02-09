import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class RefreshAllService {
  private refresh$ = new Subject();
  readonly onRefreshAll = this.refresh$.asObservable()
    .pipe(
      tap(() => console.log('Global refresh requested'))
    )

  refresh() {
    this.refresh$.next()
  }
}
