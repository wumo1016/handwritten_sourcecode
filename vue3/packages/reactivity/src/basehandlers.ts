import { extend, hasChanged, hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared/src"
import { tigger, track } from "./effect"
import { reactive, readonly } from "./reactive"
import { TiggerOpTypes, TrackOpTypes } from './operators'

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    
    const res = Reflect.get(target, key)
    if (!isReadonly) { // 可能会修改 需要收集依赖
      track(target, TrackOpTypes.Get, key)
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
    
    const oldValue = target[key]
    // 判断是否是已有属性
    const hadKey = isArray(target) && isIntegerKey(key) ?
      Number(key) < target.length  : hasOwn(target, key)
    
    const res = Reflect.set(target, key, value, receiver)
    
    if(!hadKey){ // 新增
      tigger(target, TiggerOpTypes.ADD, key)
    } else if(hasChanged(oldValue, value)){ // 修改
      tigger(target, TiggerOpTypes.SET, key, value, oldValue)
    }

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
