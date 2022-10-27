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
 * @param {*} nextProps
 */
function setInitialDOMProperties(tag, domElement, nextProps) {
  for (const propKey in nextProps) {
    if (nextProps.hasOwnProperty(propKey)) {
      const nextProp = nextProps[propKey]
      if (propKey === STYLE) {
        setValueForStyles(domElement, nextProp)
      } else if (propKey == CHILDREN) {
        if (typeof nextProp === 'string') {
          setTextContent(domElement, nextProp)
        } else if (typeof nextProp === 'number') {
          setTextContent(domElement, `${nextProp}`)
        }
      } else if (nextProp !== null) {
        setValueForProperty(domElement, propKey, nextProp)
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
