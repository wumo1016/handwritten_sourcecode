/**
 * @Author: wyb
 * @Descripttion: 设置 dom 的style
 * @param {*} dom
 * @param {*} styles
 */
export function setValueForStyles(dom, styles) {
  const { style } = dom // styles={ color: "red" }
  for (const styleName in styles) {
    if (styles.hasOwnProperty(styleName)) {
      const styleValue = styles[styleName]
      style[styleName] = styleValue
    }
  }
}
