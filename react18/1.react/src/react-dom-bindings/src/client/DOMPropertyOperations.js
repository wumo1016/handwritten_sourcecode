/**
 * @Author: wyb
 * @Descripttion: 设置 dom 属性
 * @param {*} dom
 * @param {*} key
 * @param {*} value
 */
export function setValueForProperty(dom, key, value) {
  if (value === null) {
    dom.removeAttribute(key)
  } else {
    dom.setAttribute(key, value)
  }
}
