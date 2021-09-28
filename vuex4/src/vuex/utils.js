// 循环对象
export function forEachValue(obj, fn) {
  Reflect.ownKeys(obj).forEach(key => fn(key, obj[key]))
}
// 是否是Promise
export function isPromise(val) {
  return val && typeof val?.then == 'function'
}
