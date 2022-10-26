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

export function appendInitialChild(parent, child) {
  parent.appendChild(child)
}
export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props)
}
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
