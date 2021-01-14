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
// 将vnode生成真实节点
export function createElm(vnode) {
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
    patchProps(vnode) // 设置属性
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
  } else { // 新旧 vnode diff
    // 新的和旧的标签不一样 直接替换
    if (oldVnode.tag !== vnode.tag) {
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }

    // 新的和旧的标签一样 复用老的el
    let el = vnode.el = oldVnode.el

    // 如果两个节点是文本节点 比较文本内容
    if (!vnode.tag) {
      if (vnode.text !== oldVnode.text) {
        el.textContent = vnode.text
      }
      return
    }
    // 比较属性
    patchProps(vnode, oldVnode)

    // 比对 chlidren
    const oldChildren = oldVnode.children
    const newChildren = vnode.children
    if (oldChildren.length > 0 && newChildren.length > 0) { // 都有chlidren
      patchChildren(el, oldChildren, newChildren)
    } else if (newChildren.length > 0) { // 新的有 老的没有
      for (let i = 0; i < newChildren.length; i++) {
        const child = createElm(newChildren[i])
        el.appendChild(child)
      }
    } else if (oldChildren.length > 0) { // 老的有 新的没有
      el.innerHTML = ''
    }
    return el
  }
}

// 初次渲染以及更新属性
function patchProps(vnode, oldVnode) {
  const newProps = vnode.data || {}
  const oldProps = oldVnode && oldVnode.data || {}
  const el = vnode.el
  for (const [key, value] of Object.entries(newProps)) {
    if (key === 'style') {
      for (const sn in value) {
        el.style[sn] = value[sn]
      }
    } else {
      el.setAttribute(key, value)
    }
  }
  for (const key in oldProps) {
    if (key === 'style') {
      for (const sn in oldProps[key]) {
        if (!newProps[key][sn]) {
          el.style[sn] = null
        }
      }
      continue
    }
    if (!newProps[key]) {
      el.removeAttribute(key)
    }
  }
}

// 比对children
function patchChildren(el, oldChildren, newChildren) {
  // 分别取 老的和新children的第一个和最后的索引和值
  let oldStartIndex = 0
  let oldStartVnode = oldChildren[oldStartIndex]
  let oldEndIndex = oldChildren.length - 1
  let oldEndVnode = oldChildren[oldEndIndex]

  let newStartIndex = 0
  let newStartVnode = newChildren[newStartIndex]
  let newEndIndex = newChildren.length - 1
  let newEndVnode = newChildren[newEndIndex]

  const getIndexByKey = (children) => {
    return children.reduce((obj, current, index) => {
      obj[current.key] = index
      return obj
    }, {})
  }
  const keysMap = getIndexByKey(oldChildren) // { a: 0, b: 1, c: 2, d: 3 }

  // 循环新旧指针 有一方指针重合时 结束比对
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 如果出现null的情况，直接跳到下一个
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex]
      continue
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
      continue
    }
    if (sameVnode(oldStartVnode, newStartVnode)) { // diff1 头头比较 标签一致 直接patch
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (sameVnode(oldEndVnode, newEndVnode)) { // diff3 尾尾比较
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (sameVnode(oldStartVnode, newEndVnode)) { // diff5 旧头新尾 旧头后移 新尾前移 并且将前面的元素移动到oldEndVnode的前面
      patch(oldStartVnode, newEndVnode)
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (sameVnode(newStartVnode, oldEndVnode)) { // diff6 新头旧尾
      patch(oldEndVnode, newStartVnode)
      el.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else { // diff7 乱序比对
      // 需要做一个 key 的映射表
      const moveIndex = keysMap[newStartVnode.key]
      if (moveIndex) {
        const moveVnode = oldChildren[moveIndex]
        oldChildren[moveIndex] = null // 将移走的节点设置成null
        el.insertBefore(moveVnode.el, oldStartVnode.el)
        patch(moveVnode, newStartVnode)
      } else { // 如果新节点老的没有 直接将新的插入到老的当前节点前面
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }

  while (newStartIndex <= newEndIndex) { // diff2 头尾新增
    // 取尾指针的下一个元素 作为插入标记 如果有下一个元素就是往前插入 没有就是往后插
    const anchor = newChildren[newEndIndex + 1]
    el.insertBefore(createElm(newStartVnode), anchor && anchor.el || null)
    newStartVnode = newChildren[++newStartIndex]
  }
  while (oldStartIndex <= oldEndIndex) { // diff4 头尾减少
    if (oldStartVnode) el.removeChild(oldStartVnode.el)
    oldStartVnode = oldChildren[++oldStartIndex]
  }

}

// 是否是同一节点
function sameVnode(oldVnode, newVnode) {
  return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key)
}