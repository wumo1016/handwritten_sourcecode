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

  // 调用createMatcher中的match方法 返回匹配的路由
  transitionTo(path, cb) {
    const record = this.router.match(path)
    this.current = createRoute(record, {
      path
    })
    console.log(this.current)

    cb && cb()
  }
}
