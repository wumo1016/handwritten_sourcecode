/*
 * @Description: proxy处理方法
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-27 18:47:53
 */
import { isObject } from '@vue/shared'
import { track, trigger } from './reactiveEffect'
import { reactive } from './reactive'

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
    const res = Reflect.get(target, key, recevier)
    if (isObject(res)) {
      // 当取的值也是对象的时候，我需要对这个对象在进行代理，递归代理
      return reactive(res)
    }

    return res
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
