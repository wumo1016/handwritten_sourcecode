import { isObject } from '@vue/shared'
import { trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} value
 */
export function ref(value) {
  return new RefImpl(value)
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}

/**
 * @Author: wyb
 * @Descripttion:
 */
class RefImpl {
  public _value
  private deps
  private __v_isRef = true
  constructor(public rawValue) {
    this._value = toReactive(rawValue)
  }

  get value() {
    trackEffects(this.deps || (this.deps = new Set()))
    return this._value
  }

  set value(newValue) {
    if (newValue !== this.rawValue) {
      this._value = toReactive(newValue)
      this.rawValue = newValue
      triggerEffects(this.deps)
    }
  }
}

/**
 * @Author: wyb
 * @Descripttion: 将响应式对象某个属性转化为 ref
 * @param {*} object
 * @param {*} key
 */
export function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}

class ObjectRefImpl {
  private __v_isRef = true
  constructor(public object, public key) {
    this.object = object
    this.key = key
  }

  get value() {
    return this.object[this.key]
  }

  set value(newValue) {
    this.object[this.key] = newValue
  }
}

/**
 * @Author: wyb
 * @Descripttion: 将响应式对象所有属性转化为 ref
 * @param {*} object
 */
export function toRefs(object) {
  const res = {}
  Object.keys(object).map(key => {
    res[key] = toRef(object, key)
  })
  return res
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} object
 */
export function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key, receiver) {
      const r = Reflect.get(target, key, receiver)
      return r.__v_isRef ? r.value : r
    },
    set(target, key, value, receiver) {
      if (target[key].__v_isRef) {
        target[key].value = value
        return true
      }
      return Reflect.set(object, key, value, receiver)
    }
  })
}
