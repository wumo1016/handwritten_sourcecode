import {
  isObject
} from "../utils";
import {
  arrayMethods
} from "./array";
import Dep from "./dep";
class Observer {
  constructor(data) {

    // 给对象或者数组自己也增加一个dep 用于收集watcher
    // 用于将来数组更新 $set 使用
    this.dep = new Dep()

    // 特别注意，这里不能直接定义 data.__ob__ = this 会造成死循环(Observer.__ob__ = Observer)
    Object.defineProperty(data, '__ob__', {
      enumerable: false,
      value: this
    })

    if (Array.isArray(data)) {
      // 重写数组方法 切片编程
      data.__proto__ = arrayMethods
      // 如果数组中的数据是对象，需要监控对象的变化
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }
  observeArray(data) {
    data.forEach(item => {
      observe(item)
    })
  }
  walk(data) { // 循环所有属性
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}

function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    const current = value[i] // 数组中的数组
    current.__ob__ && current.__ob__.dep.depend()
    if (Array.isArray(current)) { // 递归处理
      dependArray(current)
    }
  }
}

// JSON.stringfy 的如果是一个对象 将会对里面的所有属性进行取值
function defineReactive(data, key, value) {
  let childOb = observe(value) // 递归处理
  let dep = new Dep()
  Object.defineProperty(data, key, {
    get() {
      if (Dep.target) {
        // 可能是对象 也可能是数组 为 $set 准备
        if (childOb) {
          childOb.dep.depend()
        }
        // 当页面中使用到数值的数组的时候 直接将内层是数组的值进行依赖收集
        if (Array.isArray(value)) { // 数组中的数组，主动收集依赖
          dependArray(value)
        }
        dep.depend()
      }
      return value
    },
    set(newValue) {
      if (newValue !== value) {
        childOb = observe(newValue) // 如果用户赋值一个新对象，需要劫持
        dep.notify()
        value = newValue
      }
    }
  })
}

export function observe(data) {
  if (!isObject(data)) {
    return
  }
  if (data.__ob__) { // 说明已经被监测过了
    return data.__ob__
  }
  return new Observer(data)
}