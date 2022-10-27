import { setInitialProperties } from './ReactDOMComponent'
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
 * @param {*} internalInstanceHandle
 */
export function createInstance(type, props, internalInstanceHandle) {
  const domElement = document.createElement(type)
  // precacheFiberNode(internalInstanceHandle, domElement)
  // //把属性直接保存在domElement的属性上
  // updateFiberProps(domElement, props)
  return domElement
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
