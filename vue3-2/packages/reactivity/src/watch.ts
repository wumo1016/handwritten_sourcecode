import { ReactiveEffect } from './effect'
import { isReactive } from './baseHandler'
import { isFunction, isObject } from '@vue/shared'

/**
 * @Author: wyb
 * @Descripttion: 用来保存迭代过的对象
 * @param {*} value
 * @param {*} set
 */
function traversal(value, set = new Set()) {
  if (!isObject(value) || set.has(value)) return
  set.add(value)
  Object.keys(value).map(key => {
    traversal(value[key], set)
  })
  return value
}

/**
 * @Author: wyb
 * @Descripttion:
 */
export function watch(source, cb) {
  let getter
  if (isReactive(source)) {
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source
  }

  let oldValue, cleanUp

  const onCleanup = fn => {
    cleanUp = fn
  }

  const scheduler = () => {
    cleanUp && cleanUp()
    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }

  const effect = new ReactiveEffect(getter, scheduler)
  oldValue = effect.run()
}
