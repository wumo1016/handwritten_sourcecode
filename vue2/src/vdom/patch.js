
function createElm(vnode){
  const { vm, tag, data, children, text } = vnode
  if(typeof tag === 'string'){ // 元素
    vnode.el = document.createElement(tag)
    if(children){
      children.forEach(child => {
        vnode.el.appendChild(createElm(child))
      })
    }
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

export function patch(oldVnode, vnode){
  // 第一次 patch 时 oldVnode就是真实节点
  // 用 vnode 取替换原来的dom
  if(oldVnode.nodeType === 1){
    const parentElm = oldVnode.parentNode // 找到父元素

    const elm = createElm(vnode) // 创建真实dom
    parentElm.insertBefore(elm, oldVnode.nextSibling)

    parentElm.removeChild(oldVnode) // 最后删除老的dom
  }
}
