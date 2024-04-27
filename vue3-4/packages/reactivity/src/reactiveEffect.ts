/*
 * @Description: effect 工具方法
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-27 13:08:24
 */
import { activeEffect, trackEffect, triggerEffects } from './effect'

// 存放依赖收集的关系 targetMap: {obj: (Map => { key: (Map => { effect: effect._trackId }) }) }
const targetMap = new WeakMap()

/**
 * @Author: wyb
 * @Descripttion: 依赖手机
 * @param {*} target
 * @param {*} key
 */
export function track(target: object, key: unknown) {
  if (activeEffect) {
    // 第一层：对象 map
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      // 新增的
      targetMap.set(target, (depsMap = new Map()))
    }

    // 第二层 对象key map
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(
        key,
        (dep = createDep(() => depsMap.delete(key), key)) // 后面用于清理不需要的属性
      )
    }

    // 将当前的effect放入到dep中
    trackEffect(activeEffect, dep)
  }
}

/**
 * @Author: wyb
 * @Descripttion: 创建 dep
 * @param {Function} cleanup
 * @param {unknown} key
 */
export const createDep = (cleanup: Function, key: unknown) => {
  const dep = new Map() as any // 创建的收集器还是一个map
  dep.cleanup = cleanup
  dep.name = key // 自定义的为了标识这个映射表是给哪个属性服务的
  return dep
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} target
 * @param {*} key
 * @param {*} newValue
 * @param {*} oldValue
 */
export function trigger(
  target: object,
  key: unknown,
  newValue: any,
  oldValue: any
) {
  const depsMap = targetMap.get(target)
  // 找不到对象 直接return即可
  if (!depsMap) return
  let dep = depsMap.get(key)
  if (dep) {
    triggerEffects(dep)
  }
}
