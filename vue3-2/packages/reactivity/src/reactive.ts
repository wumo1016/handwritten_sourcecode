import { isObject } from '@vue/shared'

const reactiveMap = new WeakMap()

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} target
 */
export function reactive(target) {
  if (!isObject(target)) return target
  // 如果代理过 直接返回代理结果
  if (reactiveMap.has(target)) return reactiveMap.get(target)

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      return Reflect.set(target, key, value, receiver)
    }
  })
  // 缓存
  reactiveMap.set(target, proxy)
  return proxy
}
