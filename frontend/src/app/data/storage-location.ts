
export class StorageTree {
  storageId?: number;
  parentStorageId?: number;
  children: StorageTree[];
  storageName: string;
  event?: number;
}

export class Storage {
  storageId?: number;
  parentStorageId?: number;
  storageName: string;
  event?: number;
}

export function lastChild(objectLocationTree: StorageTree): StorageTree {
  let o = objectLocationTree;
  while (o != null) {
    if (o.children.length === 0) return o;
    if (o.children.length > 1) throw new Error("cannot call this method with a tree that has multiple children!");
    o = o.children[0];
  }
  return null; // should never happen
}

export function objectHasParentLocation(objectLocationTree: StorageTree, targetLocation: number): boolean {
  let o = objectLocationTree;
  while (o != null) {
    if (o.storageId === targetLocation) return true;
    if (o.children.length === 0) return false;
    if (o.children.length > 1) throw new Error("cannot call this method with a tree that has multiple children!");
    o = o.children[0];
  }
}

export function storageLocationToString(location: StorageTree, defaultValue: string = '', root?: number): string {
  if (location) {
    const parts = [];
    let loc = location;

    while (loc != undefined && loc.storageId !== root) {
      parts.push(loc.storageName)
      loc = loc.children[0]
    }

    return parts.join(' / ');
  } else {
    return defaultValue;
  }
}
