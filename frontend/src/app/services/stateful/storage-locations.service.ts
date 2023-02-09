import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, merge, Observable, of } from 'rxjs';
import { Storage, StorageTree } from '../../data/storage-location';
import { environment } from '../../../environments/environment';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { EventsService } from './events.service';
import { RefreshAllService } from "../refresh-all.service";
import { Events, SseService } from "../sse.service";

@Injectable({ providedIn: 'root' })
export class StorageLocationsService {
  private readonly refreshEvery = 30 * 60 * 1000
  readonly trees$: Observable<StorageTree[]>;
  readonly treesMap$: Observable<Map<number, StorageTree>>;
  readonly storagesWithParents$: Observable<Map<number, StorageTree>>;

  constructor(private http: HttpClient, events: EventsService, refreshAll: RefreshAllService, sse: SseService) {
    this.trees$ = merge(
      of(0), interval(this.refreshEvery), refreshAll.onRefreshAll,
      sse.observe(Events.StorageChanged),
      sse.observe(Events.StorageDeleted),
    )
      .pipe(
        switchMap(() => events.currentEventId$),
        switchMap((evId) => {
          const getParam = (evId ? '?eventId=' + evId : '');
          return this.http.get<StorageTree[]>(environment.apiurl + '/storage/tree' + getParam)
        }),

        shareReplay(1)
      );

    this.treesMap$ = this.trees$.pipe(
      map(locations => {
          const locToAdd: StorageTree[] = [];
          locations.forEach(l => locToAdd.push(l));

          const map = new Map<number, StorageTree>();
          while (locToAdd.length !== 0) {
            const elem = locToAdd.pop();
            elem.children.forEach(c => locToAdd.push(c));
            map.set(elem.storageId, elem);
          }

          return map;
        }),
        shareReplay(1)
      );

    this.storagesWithParents$ = this.treesMap$.pipe(
      map(m => {
        const returnMap = new Map<number, StorageTree>();

        for (let entry of m.entries()) {

          let elem = entry[1];
          let tree: StorageTree = null;
          while (elem != null) {
            const swp = new StorageTree();
            swp.storageId = elem.storageId;
            swp.event = elem.event;
            swp.storageName = elem.storageName;
            swp.parentStorageId = elem.parentStorageId;
            swp.children = (tree == null ? [] : [tree]);

            tree = swp;
            elem = m.get(elem.parentStorageId);
          }

          returnMap.set(entry[0], tree);
        }
        return returnMap;
      }),
      shareReplay(1)
    );
  }


  getStorageTree(storage: number): Observable<StorageTree> {
    return this.treesMap$.pipe(map(m => m.get(storage)));
  }


  getStorageWithParents(storage: number): Observable<StorageTree> {
    return this.storagesWithParents$.pipe(map(m => m.get(storage)));
  }

  getStoragesWithParents(inevent?: boolean): Observable<Map<number, StorageTree>> {
    if (inevent === undefined) {
      return this.storagesWithParents$;
    } else {
      return this.storagesWithParents$.pipe(map(m => {
        const copy = new Map<number, StorageTree>();
        m.forEach((elem, key) => {
          if ((elem.event === undefined) === !inevent) {
            copy.set(key, elem);
          }
        });
        return copy;
      }));
    }
  }


  createUpdateStorage(loc: Storage): Observable<void> {
    if (loc.storageId) {
      return this.http.put<void>(environment.apiurl + '/storage/' + loc.storageId, loc);
    } else {
      return this.http.post<void>(environment.apiurl + '/storage', loc);
    }
  }

  deleteStorage(loc: number): Observable<void> {
    return this.http.delete<void>(environment.apiurl + '/storage/' + loc);
  }

  moveItems(loc: number, items: string[], moveAll: boolean): Observable<void> {
    return this.http.post<void>(environment.apiurl + '/storage/move/' + loc, {
      items, moveAll
    });
  }

}
