/*
 * @Description: effect方法
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-28 20:31:14
 */

import { DirtyLevels } from './constants'

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fn
 */
export function effect(fn: Function, options?: object) {
  // 创建一个effect
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run()
  })
  _effect.run()

  // 覆盖内置选项
  if (options) {
    Object.assign(_effect, options)
  }

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect

  return runner
}

// 当前激活的 effect
export let activeEffect: ReactiveEffect

export class ReactiveEffect {
  _trackId = 0
  public active = true // 是否是响应式的
  deps: Map<unknown, unknown>[] = [] // 当前 effect 有哪些dep
  _depsLength = 0 // 当前 dep 索引, 依赖收集时使用, 每次执行前清 0
  _running = 0 // 记录是否正在执行
  _dirtyLevel = DirtyLevels.Dirty

  constructor(public fn: Function, public scheduler: Function) {}

  public get dirty() {
    return this._dirtyLevel === DirtyLevels.Dirty
  }

  public set dirty(v) {
    this._dirtyLevel = v ? DirtyLevels.Dirty : DirtyLevels.NotDirty
  }

  /**
   * @Author: wyb
   * @Descripttion: 执行fn,后续依赖的属性变化了,需要再次调用
   */
  run() {
    this._dirtyLevel = DirtyLevels.NotDirty // 每次运行后 effect 变为不脏
    // 执行 fn
    if (!this.active) return this.fn() // 不是激活的，执行后，什么都不用做

    // 缓存上一个 effect
    const lastEffect = activeEffect

    try {
      // 执行函数之前设置当前 effect
      activeEffect = this

      // 清理无用的 dep
      preCleanEffect(this)
      this._running++

      return this.fn()
    } finally {
      this._running--
      postCleanEffect(this)

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
 * @Descripttion: 前置清理 effect
 * @param {ReactiveEffect} effect
 */
function preCleanEffect(effect: ReactiveEffect) {
  effect._depsLength = 0
  effect._trackId++ // 每次执行 id 都会累加; 如果是同一个 effect 执行，id就是相同的
}

/**
 * @Author: wyb
 * @Descripttion: 后置清理 effect
 * @param {ReactiveEffect} effect
 */
function postCleanEffect(effect: ReactiveEffect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanupDepEffect(effect.deps[i], effect) // 删除映射表中对应的effect
    }
    effect.deps.length = effect._depsLength // 更新依赖列表的长度
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
  // 没有收集过再收集
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId)

    /* 处理 effect 中的 deps */
    // 从头开始 diff { flag, name } => { flag, age }
    const oldDep = effect.deps[effect._depsLength]
    if (oldDep !== dep) {
      // 清理老的
      if (oldDep) cleanupDepEffect(oldDep, effect)

      effect.deps[effect._depsLength++] = dep
    } else {
      effect._depsLength++
    }
  }
}

/**
 * @Author: wyb
 * @Descripttion: 清理dep中无用的 effect
 * @param {Map} dep
 * @param {*} unknown
 * @param {ReactiveEffect} effect
 */
function cleanupDepEffect(dep: any, effect: ReactiveEffect) {
  // 防止删除当前还在使用的 effect
  const trackId = dep.get(effect)
  if (trackId !== undefined && effect._trackId !== trackId) {
    dep.delete(effect)
    if (dep.size === 0) dep.cleanup()
  }
}

/**
 * @Author: wyb
 * @Descripttion: 派发 effect
 * @param {*} dep
 */
export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    // 如果是不脏的 触发更新需要变为脏值
    if (effect._dirtyLevel < DirtyLevels.Dirty) {
      effect._dirtyLevel = DirtyLevels.Dirty
    }

    if (!effect._running) {
      if (effect.scheduler) {
        // 如果不是正在执行，才能执行
        effect.scheduler() // -> effect.run()
      }
    }
  }
}
