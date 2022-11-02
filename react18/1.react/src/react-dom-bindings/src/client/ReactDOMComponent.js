import { setValueForStyles } from './CSSPropertyOperations'
import setTextContent from './setTextContent'
import { setValueForProperty } from './DOMPropertyOperations'
const STYLE = 'style'
const CHILDREN = 'children'

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} tag
 * @param {*} domElement
 * @param {*} props
 */
function setInitialDOMProperties(tag, domElement, props) {
  for (const key in props) {
    if (props.hasOwnProperty(key)) {
      const value = props[key]
      if (key === STYLE) {
        setValueForStyles(domElement, value)
      } else if (key == CHILDREN) {
        if (typeof value === 'string') {
          setTextContent(domElement, value)
        } else if (typeof value === 'number') {
          setTextContent(domElement, `${value}`)
        }
      } else if (value !== null) {
        setValueForProperty(domElement, key, value)
      }
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion: 设置 dom 属性
 * @param {*} domElement
 * @param {*} tag
 * @param {*} props
 */
export function setInitialProperties(domElement, tag, props) {
  setInitialDOMProperties(tag, domElement, props)
}
/**
 * @Author: wyb
 * @Descripttion: 对比属性差异
 * @param {*} domElement
 * @param {*} tag
 * @param {*} oldProps
 * @param {*} newProps
 */
export function diffProperties(domElement, tag, oldProps, newProps) {
  let updatePayload = null
  let styleUpdates = null
  // 遍历老属性 - 删除属性
  for (let propKey in oldProps) {
    // 新有 || 旧无 => 继续下一个
    if (
      newProps.hasOwnProperty(propKey) ||
      !oldProps.hasOwnProperty(propKey) ||
      oldProps[propKey] === null
    ) {
      continue
    }
    // 处理样式
    if (propKey === STYLE) {
      const oldStyle = oldProps[propKey]
      // 遍历老样式
      for (let styleName in oldStyle) {
        if (oldStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {}
          }
          styleUpdates[styleName] = ''
        }
      }
    } else {
      // 删除属性
      ;(updatePayload = updatePayload || []).push(propKey, null)
    }
  }
  // 遍历新属性 - 添加属性
  for (let propKey in newProps) {
    const newProp = newProps[propKey] // 新属性中的值
    const oldProp = oldProps !== null ? oldProps[propKey] : undefined // 老属性中的值
    // 新无 || 新旧相等 || 新旧都等于null => 继续下一个
    if (
      !newProps.hasOwnProperty(propKey) ||
      newProp === oldProp ||
      (newProp === null && oldProp === null)
    ) {
      continue
    }
    // 处理样式
    if (propKey === STYLE) {
      const oldStyle = oldProp
      if (oldStyle) {
        // 计算要删除的行内样式
        for (let styleName in oldStyle) {
          // 老有新无 删除
          if (
            oldStyle.hasOwnProperty(styleName) &&
            (!newProp || !newProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) styleUpdates = {}
            styleUpdates[styleName] = ''
          }
        }
        // 遍历新的样式对象
        const newStyle = newProp
        for (let styleName in newStyle) {
          // 如果说新的属性有，并且新属性的值和老属性不一样
          if (
            newStyle.hasOwnProperty(styleName) &&
            oldProp[styleName] !== newStyle[styleName]
          ) {
            if (!styleUpdates) styleUpdates = {}
            styleUpdates[styleName] = newStyle[styleName]
          }
        }
      } else {
        styleUpdates = newProp
      }
    } else if (propKey === CHILDREN) {
      if (typeof newProp === 'string' || typeof newProp === 'number') {
        ;(updatePayload = updatePayload || []).push(propKey, newProp)
      }
    } else {
      ;(updatePayload = updatePayload || []).push(propKey, newProp)
    }
  }
  if (styleUpdates) {
    ;(updatePayload = updatePayload || []).push(STYLE, styleUpdates)
  }
  return updatePayload // [key1,value1,key2,value2]
}
