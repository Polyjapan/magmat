export function clone<T>(o: T): T {
  const cloneObj = new (o.constructor() as any);
  for (const attr in o) {
    if (typeof o[attr] === "object") {
      cloneObj[attr] = clone(o[attr]);
    } else {
      cloneObj[attr] = o[attr];
    }
  }
  return cloneObj;
}
