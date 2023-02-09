import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, merge, Observable, of, ReplaySubject } from 'rxjs';
import { StorageLocationsService } from './storage-locations.service';
import { environment } from '../../../environments/environment';
import { distinctUntilChanged, map, shareReplay, switchMap, take } from 'rxjs/operators';
import { CompleteObject } from '../../data/object';
import { EventsService } from './events.service';
import { LoansService } from './loans.service';
import { ObjectTypesService } from './object-types.service';
import { lastChild } from '../../data/object-type';
import { UsersService } from './users.service';
import { RefreshAllService } from "../refresh-all.service";
import { Events, ObjectStatusChangeEvent, ObjectUpdatedEvent, SseService } from "../sse.service";

/**
 * Service that keeps the list of objects in sync
 */
@Injectable({ providedIn: 'root' })
export class ObjectsService {
  readonly refreshEvery = 5 * 60 * 1000
  private _objectsMap$: ReplaySubject<Map<number, CompleteObject>> = new ReplaySubject<Map<number, CompleteObject>>(1);

  readonly objectsMap$ = this._objectsMap$.asObservable()
  readonly objects$: Observable<CompleteObject[]>;

  constructor(private http: HttpClient, private events: EventsService, private storages: StorageLocationsService,
              private loans: LoansService, private objectTypes: ObjectTypesService, private users: UsersService,
              private refreshAll: RefreshAllService,
              private sse: SseService
  ) {
    // Scheduled refresh
    merge(of(0), interval(this.refreshEvery), this.refreshAll.onRefreshAll).pipe(
      switchMap(_ => this.events.currentEventId$),
      switchMap(eventId => {
        const getParam = (eventId ? '?eventId=' + eventId : '');

        return this.http.get<CompleteObject[]>(environment.apiurl + '/objects/complete' + getParam);
      }),
      switchMap((o) => this.embedObjects(o)),
      map(objects => {
        const map = new Map<number, CompleteObject>();
        objects.forEach(o => map.set(o.object.objectId, o));
        return map;
      }),
      shareReplay(1)
    ).subscribe(this._objectsMap$)

    this.objects$ = this.objectsMap$
      .pipe(
        map(objects => [...objects.values()]),
        shareReplay(1)
      )

    // Subscribe to SSE changes
    this.sse.observe<ObjectUpdatedEvent>(Events.ObjectUpdated)
      .subscribe(({ id, value }) => this.updateLocalObject(id, () => value))
    this.sse.observe<ObjectStatusChangeEvent>(Events.ObjectStatusChange)
      .subscribe(({ id, newStatus, userId }) => {
          // Reflect the changes in the local object
          this.updateLocalObject(id, (object) => ({
            ...object, object: { ...object.object, status: newStatus }, userId: userId, user: undefined
          }));
        }
      );
  }

  getObjectById(objectId: number): Observable<CompleteObject> {
    return this.objectsMap$
      .pipe(map(map => map.get(objectId)), distinctUntilChanged())
  }


  /**
   * Take an object from the server, with only IDs, and embed actual objects inside
   * @param objects
   * @private
   */
  embedObjects(objects: CompleteObject[]): Observable<CompleteObject[]> {
    return this.objectTypes.typesWithParents$.pipe(switchMap(types =>
      this.loans.loansMap$.pipe(switchMap(loans =>
        this.users.usersById$.pipe(switchMap(users =>
          this.storages.storagesWithParents$.pipe(map(locations => objects.map(obj => {
            if (obj.object.storageLocation) {
              obj.storageLocationObject = locations.get(obj.object.storageLocation);
            }
            if (obj.object.inconvStorageLocation) {
              obj.inconvStorageLocationObject = locations.get(obj.object.inconvStorageLocation);
            }
            obj.objectTypeAncestry = types.get(obj.object.objectTypeId);
            obj.objectType = lastChild(obj.objectTypeAncestry);

            // sometimes the objecttypes refresh before the objects which causes objecttypes to get lost
            obj.partOfLoanObject = obj.objectType?.partOfLoanObject ?? loans.get(obj.object.partOfLoan ?? -1);
            obj.reservedFor = obj.object.reservedFor ? users.get(obj.object.reservedFor) : undefined;
            obj.user = obj.user ?? (obj.userId ? users.get(obj.userId) : undefined)

            return obj;
          })))))))
    ));
  }

  /**
   * Updates the local copy of an object
   */
  private async updateLocalObject(id: number, updater: (current?: CompleteObject) => CompleteObject | undefined) {
    const current = await this._objectsMap$.pipe(take(1)).toPromise();
    const copied = new Map(current)

    let next = updater(current.get(id))
    next = await this.embedObjects([next]).pipe(map(arr => arr[0]), take(1)).toPromise()

    if (next) {
      copied.set(id, next)
    } else {
      copied.delete(id)
    }
    this._objectsMap$.next(copied)
  }
}
