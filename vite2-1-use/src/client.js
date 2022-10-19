console.log(`[vite] connecting....`)
const ws = new WebSocket(`ws://${window.location.host}`, 'vite-hmr')
/**
 * @Author: wyb
 * @Descripttion: 监听服务端发送的消息
 */
ws.addEventListener('message', async ({ data }) => {
  const payload = JSON.parse(data)
  switch (payload.type) {
    case 'connected':
      console.log(`[vite] connected`)
      break
    case 'update':
      payload.updates.forEach((update) => {
        if (update.type === 'js-update') {
          fetchUpdate(update)
        }
      })
  }
})
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} path 接受变更的模块路径
 * @param {*} acceptedPath 变更的模块路径
 */
async function fetchUpdate({ path, acceptedPath }) {
  // 接受变更的模块
  const module = window.hotModulesMap.get(path)
  if (!module) return
  // 存放模块路径和新的模块内容的映射
  const moduleMap = new Map()
  // 将要更新的模块集合
  const modulesToUpdate = new Set()
  for (const { deps } of module.callbacks) {
    deps.forEach((dep) => {
      if (acceptedPath === dep) {
        modulesToUpdate.add(dep)
      }
    })
  }
  await Promise.all(
    Array.from(modulesToUpdate).map(async (dep) => {
      const newModule = await import(dep + '?ts' + Date.now())
      moduleMap.set(dep, newModule)
    })
  )
  for (const { deps, callback } of module.callbacks) {
    const newModules = deps.map((dep) => moduleMap.get(dep))
    callback(newModules)
  }
  const logged = `${acceptedPath} via ${path}`
  console.log(`[vite] hot updated ${logged}`)
}
