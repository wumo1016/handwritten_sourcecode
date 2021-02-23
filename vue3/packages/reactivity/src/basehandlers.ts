import { extend, isObject } from "@vue/shared/src"
import { reactive, readonly } from "./reactive"

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key)
    if (!isReadonly) { // 可能会修改 需要收集依赖

    }
    if (shallow) {
      return res
    }
    if (isObject(res)) { // 需要递归处理 vue3是取值时才会代理
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    return res
  }
}

export const mutableHandlers = {
  get: createGetter(),
  set: createSetter()
}

export const shallowReactiveHandlers = {
  get: createGetter(false, true),
  set: createSetter(true)
}

const readonlyObj = {
  set: (target, key) => {
    console.warn(`The ${key} property is read-only`)
  }
}

export const readonlyHandlers = extend({
  get: createGetter(true),
}, readonlyObj)

export const shallowReadonlyHandlers = extend({
  get: createGetter(true, true)
}, readonlyObj)
