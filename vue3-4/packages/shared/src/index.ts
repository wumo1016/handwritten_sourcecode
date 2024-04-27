/*
 * @Description: 工具方法
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-21 18:47:50
 */
export function isObject(value: unknown) {
  return typeof value === 'object' && value !== null
}
