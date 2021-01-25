export default {
  functional: true,
  // data 就是 attrs
  render(h, { parent, data }) {
    const route = parent.$route

    // 从顶层开始渲染
    let depth = 0
    // 当渲染下一个router-view的时候 需要找到要渲染的组件 否则永远都是第一个
    while (parent) {
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++
      }
      parent = parent.$parent
    }

    let record = route.matched[depth]

    if (!record) {
      return h()
    }
    data.routerView = true
    return h(record.component, data)
  }
}
