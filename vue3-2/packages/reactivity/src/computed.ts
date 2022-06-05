import { isFunction } from '@vue/shared'
import {
  activeEffect,
  ReactiveEffect,
  trackEffects,
  triggerEffects
} from './effect'

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} getterOrOptions
 */
export function computed(getterOrOptions) {
  const isGetter = isFunction(getterOrOptions)
  let getter, setter

  const fn = () => console.warn('computed is readonly')
  if (isGetter) {
    getter = getterOrOptions
    setter = fn
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set || fn
  }
  return new ComputedRefImpl(getter, setter)
}

/**
 * @Author: wyb
 * @Descripttion:
 */
class ComputedRefImpl {
  private _value
  private _dirty = true // 是否是脏的 脏的就需要重新执行
  public effect
  public deps
  private __v_isRef = true

  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      // 如果依赖的值变了 就需要重新执行计算函数
      if (!this._dirty) this._dirty = true
      // 通知使用computed的effect执行
      triggerEffects(this.deps)
    })
  }

  get value() {
    if (activeEffect) {
      trackEffects(this.deps || (this.deps = new Set()))
    }
    if (this._dirty) {
      this._value = this.effect.run()
      this._dirty = false
    }
    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }
}
