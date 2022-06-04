import { isObject } from '@vue/shared'
import { ReactiveFlags, baseHandler } from './baseHandler'

// 缓存effect
const reactiveMap = new WeakMap()

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
  // 创建 Proxy
  const proxy = new Proxy(target, baseHandler)
  // 缓存
  reactiveMap.set(target, proxy)
  return proxy
}
