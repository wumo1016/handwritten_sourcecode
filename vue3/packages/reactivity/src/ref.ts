import { hasChanged, isObject } from "@vue/shared/src"
import { tigger, track } from "./effect"
import { TiggerOpTypes, TrackOpTypes } from "./operators"
import { reactive } from "./reactive"

export function ref(value) {
  return createRef(value)
}

export function shallowRef(value){
  return createRef(value, true)
}

function createRef(rawValue, shallow = false){
  return new RefImpl(rawValue, shallow)
}

// 如果ref传入的或设置的是对象，直接用reactive包装一下
const convert = value => isObject(value) ? reactive(value) : value

class RefImpl {
  public _value // 表示声明了_value属性
  public __v_isRef = true
  constructor(public _rawValue, public _shallow){ // 加public表示此属性放到实例上
    this._value = _shallow ? _rawValue : convert(_rawValue)
  }
  get value(){
    track(this, TrackOpTypes.Get, 'value')
    return this._value
  }
  set value(value){
    if(hasChanged(value, this._rawValue)){
      this._rawValue = value
      this._value = this._shallow ? value : convert(value)
    }
    tigger(this, TiggerOpTypes.SET, 'value', value)
  }
}

// 类的 get set 原理就是使用defineProperty