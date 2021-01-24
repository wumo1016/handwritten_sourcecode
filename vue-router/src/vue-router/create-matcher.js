import createRouteMap from './create-route-map'

export default function createMatcher(routes) {
  // 路劲和锦路匹配
  const pathMap = createRouteMap(routes) // 创建/添加 映射表

  // 动态路由：就是将新路由加入到老的路由映射表中
  function addRoutes(routes) {
    // 将新添加的路由添加进路由映射表
    createRouteMap(routes, pathMap)
    return pathMap
  }

  function match(path) {
    return pathMap[path]
  }

  return {
    addRoutes,
    match
  }
}
