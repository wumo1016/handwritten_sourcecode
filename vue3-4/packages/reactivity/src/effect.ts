/*
 * @Description: effect方法
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-27 12:02:17
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
export let activeEffect: ReactiveEffect

class ReactiveEffect {
  _trackId = 0
  public active = true // 是否是响应式的
  deps: Map<unknown, unknown>[] = [] // 当前 effect 有哪些dep
  _depsLength = 0 // 当前 dep 索引
  _running = 0

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

/**
 * @Author: wyb
 * @Descripttion: 收集 effect
 * @param {ReactiveEffect} effect
 * @param {Map} dep
 */
export function trackEffect(
  effect: ReactiveEffect,
  dep: Map<unknown, unknown>
) {
  dep.set(effect, effect._trackId)

  // 将effect于dep关联起来
  effect.deps[effect._depsLength++] = dep
}

/**
 * @Author: wyb
 * @Descripttion: 派发 effect
 * @param {*} dep
 */
export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (!effect._running) {
      if (effect.scheduler) {
        // 如果不是正在执行，才能执行
        effect.scheduler() // -> effect.run()
      }
    }
  }
}
