import { isFunction } from "@vue/shared/src";
import { effect, tigger, track } from "./effect";
import { TiggerOpTypes, TrackOpTypes } from "./operators";

export function computed(getterOrOptions){
  let getter, setter;
  if(isFunction(getterOrOptions)){
    getter = getterOrOptions
    setter = () => {
      console.warn('computed value must be readonly')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}

class ComputedRefImpl{
  public _dirty = true // 默认取值不要用缓存
  public _value
  public effect
  constructor(public getter, public setter){
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if(!this._dirty){
          this._dirty = true
          tigger(this, TiggerOpTypes.SET, 'value')
        }
      }
    })
  }
  get value(){ // 需要收集依赖
    if(this._dirty){
      this._value = this.effect()
      this._dirty = false
    }
    track(this, TrackOpTypes.Get, 'value')
    return this._value
  }
  set value(newValue){
    this.setter(newValue)
  }
}
