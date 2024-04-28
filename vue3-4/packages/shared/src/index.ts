/*
 * @Description: 工具方法
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-28 19:48:40
 */

export function isObject(value: unknown) {
  return typeof value === 'object' && value !== null
}

export function isFunction(value) {
  return typeof value == 'function'
}
