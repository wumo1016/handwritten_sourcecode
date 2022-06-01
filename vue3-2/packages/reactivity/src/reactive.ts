import { isObject } from '@vue/shared'

const reactiveMap = new WeakMap()

const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} target
 */
export function reactive(target) {
  // 不是对象 或者 已经被代理过了
  if (!isObject(target) || target[ReactiveFlags.IS_REACTIVE]) return target

  // 如果代理过 直接返回代理结果
  if (reactiveMap.has(target)) return reactiveMap.get(target)

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === ReactiveFlags.IS_REACTIVE) return true // 代理过
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
