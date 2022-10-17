console.log(`[vite] connecting....`)
var socket = new WebSocket(`ws://${window.location.host}`, 'vite-hmr')
// socket.addEventListener('message', async ({ data }) => {
//   handleMessage(JSON.parse(data))
// })

// async function handleMessage(payload) {
//   switch (payload.type) {
//     case 'connected':
//       console.log(`[vite] connected`)
//       break
//     case 'update':
//       console.log(payload)
//       payload.updates.forEach((update) => {
//         if (update.type === 'js-update') {
//           fetchUpdate(update)
//         }
//       })
//   }
// }

// async function fetchUpdate({ path, acceptedPath }) {
//   const module = window.hotModulesMap.get(path)
//   if (!module) return
//   //存放模块路径和新的模块内容的映射
//   const moduleMap = new Map()
//   //将要更新的模块集合
//   const modulesToUpdate = new Set()
//   for (const { deps, callback } of module.callbacks) {
//     deps.forEach((dep) => {
//       if (acceptedPath === dep) {
//         modulesToUpdate.add(dep)
//       }
//     })
//   }
//   await Promise.all(
//     Array.from(modulesToUpdate).map(async (dep) => {
//       const newModule = await import(dep + '?ts' + Date.now())
//       moduleMap.set(dep, newModule)
//     })
//   )
//   for (const { deps, callback } of module.callbacks) {
//     console.log(deps)
//     console.log(moduleMap)
//     let newModules = deps.map((dep) => moduleMap.get(dep))
//     console.log('newModules', newModules)
//     callback(newModules)
//   }
//   const logged = `${acceptedPath} via ${path}`
//   console.log(`[vite] hot updated ${logged}`)
// }
