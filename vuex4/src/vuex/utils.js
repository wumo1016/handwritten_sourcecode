// 循环对象
export function forEachValue(obj, fn) {
  Reflect.ownKeys(obj).forEach(key => fn(key, obj[key]))
}
