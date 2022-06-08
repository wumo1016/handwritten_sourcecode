export const isObject = value =>
  Object.prototype.toString.call(value) === '[object Object]'

export const isFunction = value =>
  Object.prototype.toString.call(value) === '[object Function]'
  
// 是否是事件
export const isOn = (key: string) => /^on[^a-z]/.test(key)

export const isString = value => {
  return typeof value === 'string'
}

export const isArray = Array.isArray
