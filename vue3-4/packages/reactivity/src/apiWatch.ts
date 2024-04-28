/*
 * @Description: watch相关
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-28 21:38:13
 */
import { isObject } from '@vue/shared'
import { ReactiveEffect } from './effect'

export function watch(source, cb, options = {} as any) {
  // watchEffect 也是基于doWatch来实现的
  return doWatch(source, cb, options)
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} source
 * @param {*} cb
 * @param {*} param3
 */
function doWatch(source, cb, { deep, immediate }) {
  const reactiveGetter = source =>
    traverse(source, deep === false ? 1 : undefined)

  // 产生一个可以给ReactiveEffect 来使用的getter， 需要对这个对象进行取值操作，会关联当前的reactiveEffect
  let getter = () => reactiveGetter(source)

  let oldValue

  const job = () => {
    const newValue = effect.run()
    cb(oldValue, newValue)
    oldValue = newValue
  }

  const effect = new ReactiveEffect(getter, job)

  oldValue = effect.run()
}

/**
 * @Author: wyb
 * @Descripttion: 遍历读取属性
 * @param {*} source 对象
 * @param {*} depth 深度
 * @param {*} currentDepth 当前深度
 * @param {*} seen 防止循环引用
 */
function traverse(source, depth, currentDepth = 0, seen = new Set()) {
  if (!isObject(source)) {
    return source
  }
  if (depth) {
    // 遍历完成
    if (currentDepth >= depth) return source
    currentDepth++ // 根据deep 属性来看是否是深度
  }
  // 当值递归
  if (seen.has(source)) return source

  for (let key in source) {
    // 读取属性 触发每个属性的 getter
    traverse(source[key], depth, currentDepth, seen)
  }

  return source
}
