/*
 * @Description:
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-05-04 11:55:50
 */

export default function patchClass(el, value) {
  if (value == null) {
    el.removeAttribute('class')
  } else {
    el.className = value
  }
}
