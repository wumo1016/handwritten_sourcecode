// 是否是对象
export const isObject = value =>
  Object.prototype.toString.call(value) === '[object Object]'

// 是否是函数
export const isFunction = value =>
  Object.prototype.toString.call(value) === '[object Function]'

// 是否是事件
export const isOn = (key: string) => /^on[^a-z]/.test(key)
