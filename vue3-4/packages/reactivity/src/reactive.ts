/*
 * @Description: reactive方法
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-28 20:03:12
 */
import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandler'
import { ReactiveFlags } from './constants'

// 记录代理结果
const reactiveMap = new WeakMap()

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} target
 */
export function reactive(target: any) {
  return createReactiveObject(target)
}

/**
 * @Author: wyb
 * @Descripttion: 创建响应式对象
 * @param {*} target
 */
function createReactiveObject(target: any) {
  // 必须是对象才可以
  if (!isObject(target)) return target

  // 如果被代理过直接返回
  if (target[ReactiveFlags.IS_REACTIVE]) return target

  // 获取缓存
  const exitsProxy = reactiveMap.get(target)
  if (exitsProxy) return exitsProxy

  const proxy = new Proxy(target, mutableHandlers)

  // 设置缓存
  reactiveMap.set(target, proxy)
  return proxy
}

/**
 * @Author: wyb
 * @Descripttion: 将一个值转成 reactive
 * @param {unknown} value
 */
export function toReactive(value: unknown) {
  return isObject(value) ? reactive(value) : value
}

/**
 * @Author: wyb
 * @Descripttion: 
 * @param {unknown} value
 */
export function isReactive(value: unknown) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}
