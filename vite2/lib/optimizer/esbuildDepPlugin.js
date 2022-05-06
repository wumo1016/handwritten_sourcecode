const fs = require('fs-extra')
const path = require('path')
const { createPluginContainer } = require('../server/pluginContainer')
const resolvePlugin = require('../plugins/resolve')

const htmlTypesRE = /\.html$/
const scriptModuleRE = /<script src\="(.+?)" type="module"><\/script>/
const JS_TYPES_RE = /\.js$/

async function esbuildScanPlugin(config, depImports) {
  config.plugins = [resolvePlugin(config)]
  const container = await createPluginContainer(config)
  const resolve = async (id, importer) => {
    // 是否是本地路径
    return await container.resolveId(id, importer)
  }
  return {
    name: 'vite:dep-scan',
    setup(build) {
      // 处理html路径
      build.onResolve({ filter: htmlTypesRE }, async ({ path, importer }) => {
        const resolved = await resolve(path, importer)
        if (resolved) {
          return {
            path: resolved.id || resolved,
            namespace: 'html'
          }
        }
      })
      // 其他类型的文件的路径
      build.onResolve({ filter: /.*/ }, async ({ path, importer }) => {
        const resolved = await resolve(path, importer)
        if (resolved) {
          const id = resolved.id || resolved
          const included = id.includes('node_modules')
          if (included) {
            depImports[path] = id
            return {
              path: id,
              external: true // 外部模块 不会再进行解析
            }
          }
          return {
            path: id
          }
        }
      })
      // 处理html读取内容
      build.onLoad({ filter: htmlTypesRE }, async ({ path, importer }) => {
        const html = fs.readFileSync(path, 'utf8')
        let [, scriptSrc] = html.match(scriptModuleRE)
        let js = `import ${JSON.stringify(scriptSrc)}` // import "./main.js"
        return {
          loader: 'js',
          contents: js
        }
      })
      // 其他类型的文件
      build.onLoad({ filter: JS_TYPES_RE }, ({ path: id }) => {
        let ext = path.extname(id).slice(1)
        let contents = fs.readFileSync(id, 'utf-8')
        return {
          loader: ext,
          contents
        }
      })
    }
  }
}

module.exports = esbuildScanPlugin
