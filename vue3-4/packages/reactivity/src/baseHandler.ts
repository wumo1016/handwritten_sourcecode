/*
 * @Description:
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-21 16:57:39
 */
export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive' // 是否被代理过
}

/**
 * @Author: wyb
 * @Descripttion:
 */
export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, recevier) {
    // 添加是否被代理过的判断
    if (key === ReactiveFlags.IS_REACTIVE) return true

    // 使用 Reflect 处理 this 问题
    return Reflect.get(target, key, recevier)
  },
  set(target, key, value, recevier) {
    return Reflect.set(target, key, value, recevier)
  }
}
