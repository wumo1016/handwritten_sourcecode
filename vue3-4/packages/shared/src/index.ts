/*
 * @Description: 工具方法
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-05-04 17:41:24
 */
export * from './shapeFlags'

export function isObject(value: unknown) {
  return typeof value === 'object' && value !== null
}

export function isFunction(value) {
  return typeof value == 'function'
}
