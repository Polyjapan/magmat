import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {Storage, StorageTree} from '../data/storage-location';
import {environment} from '../../environments/environment';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {EventsService} from './events.service';

@Injectable({providedIn: 'root'})
export class StorageLocationsService {
  private refresh$ = new BehaviorSubject(0);
  private trees$: Observable<StorageTree[]>;
  private treesMap$: Observable<Map<number, StorageTree>>;
  private storagesWithParents$: Observable<Map<number, StorageTree>>;
  private lastPull = 0;

  constructor(private http: HttpClient, events: EventsService) {
    const refresh = this.refresh$.pipe(switchMap(_ => events.getCurrentEventId()));

    this.trees$ = refresh.pipe(
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
      })
    );

    this.storagesWithParents$ = this.treesMap$.pipe(map(m => {
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
    }));
  }

  getStorages(): Observable<StorageTree[]> {
    this.refreshIfNeeded();
    return this.trees$;
  }

  getStorageTree(storage: number): Observable<StorageTree> {
    this.refreshIfNeeded();
    return this.treesMap$.pipe(map(m => m.get(storage)));
  }

  getStorageByParent(parent?: number): Observable<StorageTree[]> {
    return this.getStorages().pipe(map(lst => lst.filter(elem => elem.parentStorageId === parent)));
  }

  getStorageWithParents(storage: number): Observable<StorageTree> {
    this.refreshIfNeeded();
    return this.storagesWithParents$.pipe(map(m => m.get(storage)));
  }

  getStoragesWithParents(inevent?: boolean): Observable<Map<number, StorageTree>> {
    this.refreshIfNeeded();
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

  refresh() {
    this.lastPull = Date.now();
    this.refresh$.next(0);
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


  private refreshIfNeeded() {
    const now = Date.now();

    if (now - this.lastPull > (60 * 1000)) {
      this.refresh();
    }
  }

}
