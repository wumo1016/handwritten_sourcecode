function createComponent(vnode) {
  // 判断是否是组件 如果是 执行初始化方法
  let i = vnode.data
  if ((i = i.hook) && (i = i.init)) { // 取到 vm.data.hook.init 在创建组件vnode的时候定义的
    i(vnode)
    if (vnode.componentInstance) {
      return true
    }
  }
}

function createElm(vnode) {
  const {
    vm,
    tag,
    data,
    children,
    text
  } = vnode
  if (typeof tag === 'string') { // 元素
    // 如果是组件
    if (createComponent(vnode)) {
      // 返回组件对应的真实节点
      return vnode.componentInstance.$el
    }
    vnode.el = document.createElement(tag)
    if (children) {
      children.forEach(child => {
        vnode.el.appendChild(createElm(child))
      })
    }
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

export function patch(oldVnode, vnode) {
  // 没有oldVnode(el) 说明是组件
  if (!oldVnode) {
    const elm = createElm(vnode)
    return elm
  }
  // 第一次 patch 时 oldVnode就是真实节点
  // 用 vnode 取替换原来的dom
  if (oldVnode.nodeType === 1) {
    const parentElm = oldVnode.parentNode // 找到父元素

    const elm = createElm(vnode) // 创建真实dom
    parentElm.insertBefore(elm, oldVnode.nextSibling)
    parentElm.removeChild(oldVnode) // 最后删除老的dom

    return elm
  }
}