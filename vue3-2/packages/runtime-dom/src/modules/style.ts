/**
 * @Author: wyb
 * @Descripttion: 处理style
 * @param {*} el
 * @param {*} preValue
 * @param {*} nextValue
 */
export function patchStyle(el, preValue, nextValue) {
  const style = el.style
  for (let key in nextValue) {
    style[key] = nextValue[key]
  }
  if (preValue) {
    for (let key in preValue) {
      if (nextValue[key] == null) style[key] = null
    }
  }
}
