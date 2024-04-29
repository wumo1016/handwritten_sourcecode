/*
 * @Description: watch相关
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-29 21:02:07
 */
import { isObject, isFunction } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'
import { isRef } from './ref'

export function watch(source, cb, options = {} as any) {
  return doWatch(source, cb, options)
}

export function watchEffect(source, options = {} as any) {
  return doWatch(source, null, options)
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

  let getter
  // 产生一个可以给ReactiveEffect 来使用的getter， 需要对这个对象进行取值操作，会关联当前的reactiveEffect
  if (isReactive(source)) {
    getter = () => reactiveGetter(source)
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (isFunction(source)) {
    getter = source
  }

  let oldValue

  let clean
  const onCleanup = fn => {
    clean = () => {
      fn()
      clean = undefined
    }
  }

  const job = () => {
    if (cb) {
      const newValue = effect.run()

      if (clean) clean()

      cb(oldValue, newValue, onCleanup)
      oldValue = newValue
    } else {
      effect.run()
    }
  }

  const effect = new ReactiveEffect(getter, job)

  if (cb) {
    // 立即执行一次
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

  const unwatch = () => {
    effect.stop()
  }

  return unwatch
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
