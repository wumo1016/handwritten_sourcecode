import { track, trigger } from './effect'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
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
    return Reflect.get(target, key, receiver)
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
