import {
  isObject
} from "../utils";
import {
  arrayMethods
} from "./array";
import Dep from "./dep";
class Observer {
  constructor(data) {
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

function defineReactive(data, key, value) {
  observe(value) // 递归处理
  let dep = new Dep()
  Object.defineProperty(data, key, {
    get() {
      if(Dep.target){
        dep.depend()
      }
      return value
    },
    set(newValue) {
      if(newValue !== value){
        observe(newValue) // 如果用户赋值一个新对象，需要劫持
        value = newValue
        dep.notify()
      }
    }
  })
}

export function observe(data) {
  if (!isObject(data)) {
    return
  }
  if (data.__ob__) { // 说明已经被监测过了
    return
  }
  return new Observer(data)
}