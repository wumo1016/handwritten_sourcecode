/**
 * @Author: wyb
 * @Descripttion: 节点操作
 */
export const nodeOps = {
  createElement(tagName) {
    return document.createElement(tagName)
  },
  createTextNode(text) {
    return document.createTextNode(text)
  },
  insert(element, container, anchor = null) {
    container.insertBefore(element, anchor)
  },
  remove(child) {
    const parent = child.parentNode
    parent && parent.removeChild(child)
  },
  querySelector(selectors) {
    return document.querySelector(selectors)
  },
  parentNode(child) {
    return child.parentNode
  },
  nextSibling(child) {
    return child.nextSibling
  },
  /**
   * @Author: wyb
   * @Descripttion: 给文本节点设置内容
   * @param {*} element
   * @param {*} text
   */
  setText(element, text) {
    element.nodeValue = text
  },
  /**
   * @Author: wyb
   * @Descripttion: 给元素节点设置内容
   * @param {*} element
   * @param {*} text
   */
  setElementText(element, text) {
    element.textContent = text
  }
}
