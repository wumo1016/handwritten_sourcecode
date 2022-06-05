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
