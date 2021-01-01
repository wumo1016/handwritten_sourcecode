import { isObject } from "../utils";

class Observer {
  constructor(data){
    this.walk(data)
  }
  walk(data){ // 循环所有属性
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}

function defineReactive(data, key, value){
  observe(value) // 递归处理
  Object.defineProperty(data, key, {
    get(){
      return value
    },
    set(newValue){
      observe(observe) // 如果用户赋值一个新对象，需要劫持
      value = newValue
    }
  })
  // log(data, key, value)
}

export function observe(data){
  if(!isObject(data)){
    return
  }
  return new Observer(data)
}
