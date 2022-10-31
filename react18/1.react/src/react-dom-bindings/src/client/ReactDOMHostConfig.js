import { diffProperties, setInitialProperties } from './ReactDOMComponent'
import { precacheFiberNode, updateFiberProps } from './ReactDOMComponentTree'

export function shouldSetTextContent(type, props) {
  return (
    typeof props.children === 'string' || typeof props.children === 'number'
  )
}
/**
 * @Author: wyb
 * @Descripttion: 创建文本节点
 * @param {*} content
 */
export function createTextInstance(content) {
  return document.createTextNode(content)
}
/**
 * @Author: wyb
 * @Descripttion: 创建标签节点
 * @param {*} type
 * @param {*} props
 * @param {*} fiber
 */
export function createInstance(type, props, fiber) {
  const dom = document.createElement(type)
  // 将 fiber 缓存到 dom 节点上
  precacheFiberNode(fiber, dom)
  // 将 props 缓存到 dom 节点上
  updateFiberProps(dom, props)
  return dom
}
/**
 * @Author: wyb
 * @Descripttion: 添加子节点
 * @param {*} parent
 * @param {*} child
 */
export function appendInitialChild(parent, child) {
  parent.appendChild(child)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} domElement
 * @param {*} type
 * @param {*} props
 */
export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} parentInstance
 * @param {*} child
 */
export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child)
}
/**
 *
 * @param {*} parentInstance 父DOM节点
 * @param {*} child 子DOM节点
 * @param {*} beforeChild 插入到谁的前面，它也是一个DOM节点
 */
export function insertBefore(parentInstance, child, beforeChild) {
  parentInstance.insertBefore(child, beforeChild)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} domElement
 * @param {*} type
 * @param {*} oldProps
 * @param {*} newProps
 */
export function prepareUpdate(domElement, type, oldProps, newProps) {
  return diffProperties(domElement, type, oldProps, newProps)
}

export function commitUpdate(
  domElement,
  updatePayload,
  type,
  oldProps,
  newProps
) {
  updateProperties(domElement, updatePayload, type, oldProps, newProps)
  updateFiberProps(domElement, newProps)
}

export function removeChild(parentInstance, child) {
  parentInstance.removeChild(child)
}
