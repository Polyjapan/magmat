import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CompleteObject, ObjectCreateResult, ObjectStatus, SingleObject } from '../data/object';

@Injectable({ providedIn: 'root' })
export class ObjectsMutationService {
  constructor(private http: HttpClient) {}

  updateObject(object: CompleteObject, eventId: number): Observable<void> {
    const params = eventId ? "?eventId=" + eventId : "";
    return this.http
      .put<void>(environment.apiurl + '/objects/' + object.object.objectId + params, object.object)
  }

  createObjects(objects: SingleObject[], eventId?: number): Observable<ObjectCreateResult> {
    const getParameter = eventId ? '?eventId=' + eventId : '';
    return this.http.post<ObjectCreateResult>(environment.apiurl + '/objects/' + getParameter, objects);
  }

  changeState(objectId: number, targetState: ObjectStatus, user: number, signature?: string): Observable<void> {
    return this.http.put<void>(environment.apiurl + '/objects/state/' + objectId, {
      targetState, userId: user, signature
    });
  }
}
