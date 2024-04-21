/*
 * @Description: effect方法
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-21 18:36:15
 */

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fn
 */
export function effect(fn: Function) {
  // 创建一个effect
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run()
  })
  _effect.run()
  return _effect
}

// 当前激活的 effect
export let activeEffect: typeof ReactiveEffect.prototype

class ReactiveEffect {
  public active = true // 是否是响应式的

  constructor(public fn: Function, public scheduler: Function) {}

  /**
   * @Author: wyb
   * @Descripttion: 执行fn,后续依赖的属性变化了,需要再次调用
   */
  run() {
    // 执行 fn
    if (!this.active) return this.fn() // 不是激活的，执行后，什么都不用做

    // 缓存上一个 effect
    const lastEffect = activeEffect

    try {
      // 执行函数之前设置当前 effect
      activeEffect = this

      return this.fn()
    } finally {
      // 恢复上一个 effect
      activeEffect = lastEffect
    }
  }
  /**
   * @Author: wyb
   * @Descripttion: 停止当前 effect 的响应式
   */
  stop() {
    this.active = false
  }
}
