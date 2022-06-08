import {StorageTree} from './storage-location';
import {CompleteExternalLoan} from './external-loan';
import {ObjectType, ObjectTypeAncestry} from './object-type';
import {UserProfile} from './user';

export enum ObjectStatus {
  IN_STOCK = 'InStock', OUT = 'Out', LOST = 'Lost', RESTING = 'Resting', DELETED = 'Deleted'
}

export function statusToString(status: ObjectStatus) {
  switch (status) {
    case ObjectStatus.IN_STOCK:
      return 'En stock';
    case ObjectStatus.LOST:
      return 'Perdu';
    case ObjectStatus.OUT:
      return 'Prêté';
    case ObjectStatus.RESTING:
      return 'Déposé';
    case ObjectStatus.DELETED:
      return 'Remisé';
  }
}

export class SingleObject {
  objectId?: number;
  objectTypeId: number;
  suffix: string;
  description?: string;
  storageLocation?: number;
  inconvStorageLocation?: number;
  partOfLoan?: number;
  reservedFor?: number;
  plannedUse?: string;
  depositPlace?: string;
  assetTag?: string;
  status: ObjectStatus;
  requiresSignature: boolean = false;
}

export class CompleteObject {
  object: SingleObject;
  objectType?: ObjectType;
  objectTypeAncestry?: ObjectTypeAncestry;
  storageLocationObject?: StorageTree;
  inconvStorageLocationObject?: StorageTree;
  partOfLoanObject?: CompleteExternalLoan;

  reservedFor?: UserProfile;
}

export class CompleteObjectWithUser {
  object: CompleteObject;
  user: UserProfile;
}

export class ObjectCreateResult {
  inserted: SingleObject[];
  notInserted: SingleObject[];
}
