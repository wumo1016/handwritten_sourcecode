export default function createRouteMap(routes, oldPathMap) {
  let pathMap = oldPathMap || {}

  routes.forEach(route => {
    addRouteRecord(route, pathMap)
  })

  return pathMap
}

// parent 用于拼接路径
function addRouteRecord(route, pathMap, parent) {
  let { path, component, props } = route
  if (!path.startsWith('/') && parent) {
    path = `${parent.path}/${path}`
  }
  const record = {
    path,
    component,
    props: props || {},
    parent
  }
  pathMap[path] = record

  // 递归处理
  route.children &&
    route.children.forEach(childRoute => {
      addRouteRecord(childRoute, pathMap, record)
    })
}
