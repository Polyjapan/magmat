import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, merge, Observable, of, ReplaySubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { debounce, debounceTime, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { EventsService } from './events.service';
import { ObjectType, ObjectTypeAncestry, ObjectTypeTree } from '../../data/object-type';
import { LoansService } from './loans.service';
import { RefreshAllService } from "../refresh-all.service";
import { Events, SseService } from "../sse.service";

@Injectable({ providedIn: 'root' })
export class ObjectTypesService {
  readonly trees$: Observable<ObjectTypeTree[]>;
  readonly typesWithParents$: Observable<Map<number, ObjectTypeAncestry>>;
  private readonly refreshEvery = 30 * 60 * 1000
  readonly treesMap$: Observable<Map<number, ObjectTypeTree>>;

  constructor(private http: HttpClient, events: EventsService, loans: LoansService, refreshAll: RefreshAllService, private sse: SseService) {
    this.trees$ = merge(
      // Refresh/Reload conditions
      of(0),
      interval(this.refreshEvery),
      refreshAll.onRefreshAll,
      this.sse.observe(Events.ObjectTypeUpdated),
      this.sse.observe(Events.ObjectTypeDeleted)
    )
      .pipe(
        switchMap(_ => events.currentEventId$),
        switchMap((eventId) => {
          const getParam = (eventId ? '?eventId=' + eventId : '');
          return this.http.get<ObjectTypeTree[]>(environment.apiurl + '/objects/types/tree' + getParam);
        }),
        switchMap(objects => loans.loansMap$.pipe(map(loans => {
          const transform: ObjectTypeTree[] = [];
          objects.forEach(o => transform.push(o))
          while (transform.length != 0) {
            const elem = transform.pop();
            elem.children.forEach(c => transform.push(c))

            if (elem.objectType.partOfLoan) {
              elem.objectType.partOfLoanObject = loans.get(elem.objectType.partOfLoan);
            }
          }
          return objects; // objects modified directly, no need to return a diff. array
        }))),
        shareReplay(1)
      )

    this.treesMap$ = this.trees$.pipe(
        map(locations => {
          const locToAdd: ObjectTypeTree[] = [];
          locations.forEach(l => locToAdd.push(l));

          const map = new Map<number, ObjectTypeTree>();
          while (locToAdd.length !== 0) {
            const elem = locToAdd.pop();
            elem.children.forEach(c => locToAdd.push(c));
            map.set(elem.objectType.objectTypeId, elem);
          }

          return map;
        }),
        shareReplay(1)
      )

    this.typesWithParents$ = this.treesMap$.pipe(
      map(m => {
        const returnMap = new Map<number, ObjectTypeAncestry>();

        for (let entry of m.entries()) {

          let elem = entry[1];
          let tree: ObjectTypeAncestry = null;
          while (elem != null) {
            const swp = new ObjectTypeAncestry();
            swp.objectType = elem.objectType;
            if (tree) {
              swp.child = tree;
            }

            tree = swp;
            elem = m.get(elem.objectType.parentObjectTypeId);
          }

          returnMap.set(entry[0], tree);
        }
        return returnMap;
      }),
      shareReplay(1)
    );
  }

  getObjectTypeTree(type: number): Observable<ObjectTypeTree> {
    return this.treesMap$.pipe(
      map(m => m.get(type))
    );
  }

  getObjectTypeWithParents(type: number): Observable<ObjectTypeAncestry> {
    return this.typesWithParents$.pipe(
      map(m => m.get(type))
    );
  }

  createOrUpdateObjectType(type: ObjectType): Observable<number> {
    if (type.objectTypeId) {
      const id = type.objectTypeId;
      return this.http.put(environment.apiurl + '/objects/types/' + type.objectTypeId, type).pipe(map(u => id));
    } else {
      return this.http.post<number>(environment.apiurl + '/objects/types', type);
    }
  }

  deleteObjectType(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiurl + '/objects/types/' + id);
  }
}
