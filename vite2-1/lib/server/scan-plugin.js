const fs = require('fs-extra')
const createPluginContainer = require('./plugin-container')
const { htmlTypesRE, scriptModuleRE, normalizePath } = require('../utils')
const resolvePlugin = require('../plugins/resolve')

/**
 * @Author: wyb
 * @Descripttion: esbuild扫描第三方依赖的插件
 */
async function getScanPlugin(config, depImports) {
  // 创建插件容器
  const container = await createPluginContainer({
    plugins: [resolvePlugin(config)],
    root: config.root
  })
  const resolve = (path, importer) => {
    // 有容器进行路径解析，返回绝对路径
    return container.resolveId(path, importer)
  }
  return {
    name: 'sacn',
    setup(build) {
      //如果遇到vue文件，则返回它的绝对路径，并且标识为外部依赖，不再进一步解析了
      build.onResolve({ filter: /\.vue$/ }, async ({ path: id, importer }) => {
        const resolved = await resolve(id, importer)
        if (resolved) {
          return {
            path: resolved.id || resolved,
            external: true
          }
        }
      })
      /* ------------------------ 处理html ------------------------ */
      // 处理 html
      build.onResolve({ filter: htmlTypesRE }, async ({ path, importer }) => {
        const resolved = await resolve(path, importer)
        if (resolved) {
          return {
            path: resolved.id || resolved,
            namespace: 'html'
          }
        }
      })
      // 将html处理成js
      build.onLoad(
        { filter: htmlTypesRE, namespace: 'html' },
        async ({ path }) => {
          const html = fs.readFileSync(path, 'utf8')
          const [, src] = html.match(scriptModuleRE) // 获取入口js
          const jsContent = `import ${JSON.stringify(src)}`
          return {
            contents: jsContent,
            loader: 'js'
          }
        }
      )
      /* ------------------------ 所有文件 ------------------------ */
      build.onResolve({ filter: /.*/ }, async ({ path, importer }) => {
        const resolved = await resolve(path, importer)
        if (resolved) {
          const id = resolved.id || resolved // 此模块额绝对路径
          // 如果是第三方依赖
          if (id.includes('node_modules')) {
            depImports[path] = normalizePath(id)
            return {
              path: id,
              external: true
            }
          } else {
            return {
              path: id
            }
          }
        }
      })
    }
  }
}

module.exports = getScanPlugin
