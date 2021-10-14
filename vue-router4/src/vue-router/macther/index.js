/**
 * @Author: wyb
 * @Descripttion: 格式化单个路由信息
 * @param {*} route
 */
function normalizeRouteRecord(route) {
  return {
    name: route.name,
    path: route.path,
    meta: route.meta || {},
    beforeEnter: route.beforeEnter,
    children: route.children || [],
    components: {
      default: route.component
    }
  }
}

function createRouteRecordMatcher(record, parent) {
  const matcher = {
    path: record.path,
    record: record,
    parent,
    children: []
  }
  if (parent) {
    parent.children.push(matcher)
    matcher.path = parent.path + matcher.path
  }
  return matcher
}

export function createRouterMatcher(routes) {
  const matchers = []

  function addRoute(route, parent) {
    const normalizeRecord = normalizeRouteRecord(route)

    const matcher = createRouteRecordMatcher(normalizeRecord, parent)
    matchers.push(matcher)

    normalizeRecord.children.forEach(c => addRoute(c, matcher))
  }

  routes.forEach(route => addRoute(route, null))

  function resolve(location) {
    const matched = []

    let mactcher = matchers.find(m => m.path === location.path)
    while (mactcher) {
      matched.unshift(mactcher.record) // 将用户的原始数据 放到matched中
      mactcher = mactcher.parent
    }

    return {
      path: location.path,
      matched
    }
  }

  return {
    addRoute,
    matchers,
    resolve
  }
}
