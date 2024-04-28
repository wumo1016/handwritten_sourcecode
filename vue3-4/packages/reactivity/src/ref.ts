/*
 * @Description: ref 相关
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-28 20:21:33
 */

import { activeEffect, trackEffect, triggerEffects } from './effect'
import { toReactive } from './reactive'

export function ref(value: unknown) {
  return createRef(value)
}

/**
 * @Author: wyb
 * @Descripttion: 创建ref
 * @param {unknown} value
 */
function createRef(value: unknown) {
  return new RefImpl(value)
}

class RefImpl {
  public __v_isRef = true // 增加ref标识
  public _value: unknown // 用来保存ref的值的
  public dep?: Map<object, string> // 用于收集对应的effect

  constructor(public rawValue: unknown) {
    this._value = toReactive(rawValue)
  }

  /**
   * @Author: wyb
   * @Descripttion: 获取值
   */
  get value() {
    trackRefValue(this)
    return this._value
  }

  /**
   * @Author: wyb
   * @Descripttion: 设置值
   * @param {*} newValue
   */
  set value(newValue: unknown) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue
      this._value = newValue
      triggerRefValue(this)
    }
  }
}

/**
 * @Author: wyb
 * @Descripttion: 收集ref依赖
 * @param {*} ref
 */
export function trackRefValue(ref: any) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep = createDep(() => (ref.dep = undefined), 'undefined'))
    )
  }
}

/**
 * @Author: wyb
 * @Descripttion: 触发ref更新
 * @param {*} ref
 */
export function triggerRefValue(ref: any) {
  const dep = ref.dep
  if (dep) triggerEffects(dep)
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {Function} cleanup
 * @param {unknown} key
 */
export const createDep = (cleanup: Function, key: unknown) => {
  const dep = new Map() as any // 创建的收集器还是一个map
  dep.cleanup = cleanup
  dep.name = key // 自定义的为了标识这个映射表是给哪个属性服务的
  return dep
}

class ObjectRefImpl {
  public __v_isRef = true // 增加ref标识

  constructor(public _object: object, public _key: string) {}

  get value() {
    return this._object[this._key]
  }

  set value(newValue) {
    this._object[this._key] = newValue
  }
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {object} object
 * @param {string} key
 */
export function toRef(object: object, key: string) {
  return new ObjectRefImpl(object, key)
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {object} object
 */
export function toRefs(object: object) {
  const res = {}
  for (let key in object) {
    res[key] = toRef(object, key)
  }
  return res
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {object} objectWithRef
 */
export function proxyRefs(objectWithRef: object) {
  return new Proxy(objectWithRef, {
    /**
     * @Author: wyb
     * @Descripttion:
     * @param {*} target
     * @param {*} key
     * @param {*} receiver
     */
    get(target, key, receiver) {
      let r = Reflect.get(target, key, receiver)
      return r.__v_isRef ? r.value : r // 自动脱 ref
    },
    /**
     * @Author: wyb
     * @Descripttion:
     * @param {*} target
     * @param {*} key
     * @param {*} value
     * @param {*} receiver
     */
    set(target, key, value, receiver) {
      const oldValue = target[key]
      if (oldValue.__v_isRef) {
        oldValue.value = value // 如果老值是ref 需要给ref赋值
        return true
      } else {
        return Reflect.set(target, key, value, receiver)
      }
    }
  })
}
