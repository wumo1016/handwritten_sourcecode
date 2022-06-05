import { isObject } from '@vue/shared'
import { reactive } from './reactive'
import { track, trigger } from './effect'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

export function isReactive(value) {
  return value && value[ReactiveFlags.IS_REACTIVE]
}

/**
 * @Author: wyb
 * @Descripttion: proxy 处理函数
 */
export const baseHandler = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true // 代理过
    // 依赖收集
    track(target, key)
    const res = Reflect.get(target, key, receiver)
    // 懒代理
    if (isObject(res)) return reactive(res)
    return res
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]
    if (oldValue !== value) {
      const result = Reflect.set(target, key, value, receiver)
      trigger(target, key, value)
      return result
    }
  }
}
