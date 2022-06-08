import { isOn } from '@vue/shared'
import { patchAttr } from './modules/attrs'
import { patchClass } from './modules/class'
import { patchEvent } from './modules/events'
import { patchStyle } from './modules/style'

/**
 * @Author: wyb
 * @Descripttion: 属性操作
 * @param {*} el
 * @param {*} key
 * @param {*} preValue
 * @param {*} nextValue
 */
export const patchProp = (el, key, preValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, preValue, nextValue)
  } else if (isOn(key)) {
    patchEvent(el, key, nextValue)
  } else {
    patchAttr(el, key, nextValue)
  }
}
