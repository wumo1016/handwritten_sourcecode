// 获取所有匹配到的路径
function createRoute(record, path) {
  const matched = []
  // 向父级查找
  while (record) {
    matched.unshift(record)
    record = record.parent
  }
  return {
    ...path,
    matched
  }
}

export default class History {
  constructor(router) {
    this.router = router
    // console.log(router)

    // 当前匹配路径信息
    this.current = createRoute(null, {
      path: '/'
    })
  }

  listen(cb) {
    this.cb = cb
  }

  // 调用createMatcher中的match方法 返回匹配的路由
  transitionTo(path, cb) {
    // 找到当前路径匹配的路由信息
    // 然后再找到其所有的父路由信息 都加入一个数组中
    const record = this.router.match(path)

    const newCurrent = createRoute(record, {
      path
    })
    // 防止更改地址后 触发地址变更事件 再次走transitionTo
    // 第一次的时候 路径相同 但是匹配的不同
    if (
      path === this.current.path &&
      this.current.matched.length === newCurrent.matched.length
    ) {
      return
    }
    // 因为收集依赖是对 _route 也就是对 current和$route 收集的 而直接修改 current 并不会触发更新
    this.current = newCurrent
    this.cb && this.cb(newCurrent)
    cb && cb()
  }
}
