export function forEachObj(obj, fn) {
  Object.keys(obj).forEach(key => fn(key, obj[key]))
}

export const DefaultKey = 'DefaultStoreKey'
