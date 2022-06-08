import {StorageTree} from './storage-location';
import {CompleteExternalLoan} from './external-loan';
import {ObjectTypesService} from '../services/object-types.service';

export class ObjectType {
  objectTypeId?: number;
  parentObjectTypeId?: number;
  name: string;
  description?: string;
  partOfLoan?: number;
  partOfLoanObject?: CompleteExternalLoan;
}

export class ObjectTypeTree {
  objectType: ObjectType;
  children: ObjectTypeTree[];
}

export class ObjectTypeAncestry {
  objectType: ObjectType;
  child?: ObjectTypeAncestry;
}

export function lastChild(ancestry: ObjectTypeAncestry): ObjectType {
  let o = ancestry;
  while (o != null) {
    if (!o.child) return o.objectType;
    o = o.child;
  }
  return null; // should never happen
}

export function objectHasParentObjectType(objectTypeTree: ObjectTypeAncestry, parentObjectType: number): boolean {
  let o = objectTypeTree;
  while (o != null) {
    if (o.objectType.objectTypeId === parentObjectType) return true;
    if (!o.child) return false;
    o = o.child;
  }
}

export function objectTypeToString(objectType: ObjectTypeAncestry, defaultValue: string = '', root?: number): string {
  if (location) {
    const parts = [];
    let ancestry = objectType;

    while (ancestry != undefined && ancestry.objectType.objectTypeId !== root) {
      parts.push(ancestry.objectType.name)
      ancestry = ancestry.child;
    }

    return parts.join(' / ');
  } else {
    return defaultValue;
  }
}
