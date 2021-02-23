import { isObject } from "@vue/shared/src"
import { mutableHandlers, readonlyHandlers, shallowReactiveHandlers, shallowReadonlyHandlers } from "./basehandlers"

export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers)
}

export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers)
}

export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers)
}

// 缓存代理结果
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
function createReactiveObject(target, isReadonly, baseHandlers) {
  // 如果不是对象 直接返回
  if (!isObject(target)) {
    return target
  }

  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  // 如果已经被代理过了 直接返回代理后的结果
  // 可能一个被深度代理了 然后里面的又被仅读代理了
  const targetProxy = proxyMap.get(target)
  if (targetProxy) {
    return targetProxy
  }

  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)

  return  proxy
}
