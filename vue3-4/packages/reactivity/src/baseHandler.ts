/*
 * @Description: proxy处理方法
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-27 12:02:30
 */
import { track, trigger } from './reactiveEffect'

/*
 * @Description:
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-27 11:19:58
 */
export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive' // 是否被代理过
}

/**
 * @Author: wyb
 * @Descripttion:
 */
export const mutableHandlers: ProxyHandler<object> = {
  get(target, key, recevier) {
    // 添加是否被代理过的判断
    if (key === ReactiveFlags.IS_REACTIVE) return true

    track(target, key)

    // 使用 Reflect 处理 this 问题
    return Reflect.get(target, key, recevier)
  },
  set(target, key, value, recevier) {
    const oldValue = target[key]

    const result = Reflect.set(target, key, value, recevier)

    // 触发更新
    if (oldValue !== value) {
      trigger(target, key, value, oldValue)
    }

    return result
  }
}
