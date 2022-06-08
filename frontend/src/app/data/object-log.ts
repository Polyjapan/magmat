import {ObjectStatus, SingleObject} from './object';
import {UserProfile} from './user';
import {ObjectType} from './object-type';

export class ObjectLog {
  objectId: number;
  eventId: number;
  timestamp: Date;
  changedBy: number;
  user: number;
  sourceState: ObjectStatus;
  targetState: ObjectStatus;
  signature?: string;
}

export class ObjectLogWithUser {
  objectLog: ObjectLog;
  user: UserProfile;
  changedBy: UserProfile;
}

export class ObjectLogWithObject {
  objectLog: ObjectLog;
  object: SingleObject;
  objectType: ObjectType;
}
