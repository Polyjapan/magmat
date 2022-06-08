import {ObjectStatus} from './object';
import {UserProfile} from './user';

export class ObjectComment {
  objectId: number;
  eventId: number;
  timestamp: Date;
  writer: number;
  comment: string;
}

export class CompleteObjectComment {
  objectComment: ObjectComment;
  writer: UserProfile;
}
