import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {EventsService} from './events.service';
import {ObjectType, ObjectTypeAncestry, ObjectTypeTree} from '../data/object-type';
import {LoansService} from './loans.service';

@Injectable({providedIn: 'root'})
export class ObjectTypesService {
  private refresh$ = new BehaviorSubject(0);
  private trees$: Observable<ObjectTypeTree[]>;
  private treesMap$: Observable<Map<number, ObjectTypeTree>>;
  private typesWithParents: Observable<Map<number, ObjectTypeAncestry>>;
  private lastPull = 0;

  constructor(private http: HttpClient, events: EventsService, loans: LoansService) {
    const refresh = this.refresh$.pipe(switchMap(_ => events.getCurrentEventId()));

    this.trees$ = refresh.pipe(
      switchMap((evId) => {
        const getParam = (evId ? '?eventId=' + evId : '');
        return this.http.get<ObjectTypeTree[]>(environment.apiurl + '/objects/types/tree' + getParam);
      }),
      switchMap(objects => loans.getLoansMap().pipe(map(loans => {
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
    );

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
      })
    );

    this.typesWithParents = this.treesMap$.pipe(map(m => {
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
    }));
  }

  getObjectTypes(): Observable<ObjectTypeTree[]> {
    this.refreshIfNeeded();
    return this.trees$;
  }

  getObjectTypeTree(type: number): Observable<ObjectTypeTree> {
    this.refreshIfNeeded();
    return this.treesMap$.pipe(map(m => m.get(type)));
  }

  getObjectType(type: number): Observable<ObjectType> {
    return this.getObjectTypeTree(type).pipe(map(t => t?.objectType));
  }

  getObjectTypesByParent(parent?: number): Observable<ObjectTypeTree[]> {
    return this.getObjectTypes().pipe(map(lst => lst.filter(elem => elem.objectType.parentObjectTypeId === parent)));
  }

  getObjectTypeWithParents(type: number): Observable<ObjectTypeAncestry> {
    return this.getObjectTypesWithParents().pipe(map(m => m.get(type)));
  }

  getObjectTypesWithParents(): Observable<Map<number, ObjectTypeAncestry>> {
    this.refreshIfNeeded();
    return this.typesWithParents;
  }

  refresh() {
    this.lastPull = Date.now();
    this.refresh$.next(0);
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

  private refreshIfNeeded() {
    const now = Date.now();

    if (now - this.lastPull > (60 * 1000)) {
      this.refresh();
    }
  }

}
