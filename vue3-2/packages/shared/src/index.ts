// 是否是对象
export const isObject = value =>
  Object.prototype.toString.call(value) === '[object Object]'
