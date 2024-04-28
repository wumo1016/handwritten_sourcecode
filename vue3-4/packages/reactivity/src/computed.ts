/*
 * @Description: conputed相关
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-28 20:25:45
 */
import { isFunction } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

class ComputedRefImpl {
  public _value
  public effect
  public dep

  constructor(getter: Function, public setter: Function) {
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        // 计算属性依赖的值变化了，我们应该触发渲染effect重新执行
        // 依赖的属性变化后需要触发重新渲染，还需要将 dirty 变为true
        triggerRefValue(this)
      }
    )
  }

  get value() {
    if (this.effect.dirty) {
      this._value = this.effect.run()
      trackRefValue(this)
    }
    return this._value
  }

  set value(v) {
    this.setter(v)
  }
}

export function computed(getterOrOptions: any) {
  const onlyGetter = isFunction(getterOrOptions)

  let getter: Function
  let setter: Function
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {}
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
