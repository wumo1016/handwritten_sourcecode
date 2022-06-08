/**
 * @Author: wyb
 * @Descripttion: 处理 class
 * @param {*} el
 * @param {*} nextValue
 */
export function patchClass(el, nextValue) {
  if (nextValue == null) {
    el.removeAttribute('class')
  } else {
    el.className = nextValue
  }
}
