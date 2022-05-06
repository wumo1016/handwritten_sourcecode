const fs = require('fs')
const path = require('path')
const resolve = require('resolve')
/**
 * @Author: wyb
 * @Descripttion: 解析插件路径
 * @param {*} config
 */
function resolvePlugin(config) {
  return {
    name: 'vite:resolve',
    resolveId(id, importer) {
      //如果/开头表示是绝对路径
      if (id.startsWith('/')) {
        return { id: path.resolve(config.root, id.slice(1)) }
      }
      //如果是绝对路径
      if (path.isAbsolute(id)) {
        return { id }
      }
      //如果是相对路径
      if (id.startsWith('.')) {
        const basedir = path.dirname(importer)
        const fsPath = path.resolve(basedir, id)
        return { id: fsPath }
      }
      //如果是第三方包
      let res = tryNodeResolve(id, importer, config)
      if (res) {
        return res
      }
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion: 解析第三方包路径
 * @param {*} id
 * @param {*} importer
 * @param {*} config
 */
function tryNodeResolve(id, importer, config) {
  const pkgPath = resolve.sync(`${id}/package.json`, { basedir: config.root }) // E:\wumo\handwritten_sourcecode\vite2\node_modules\vue\package.json
  const pkgDir = path.dirname(pkgPath) // E:\wumo\handwritten_sourcecode\vite2\node_modules\vue
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const entryPoint = pkg.module // dist/vue.runtime.esm-bundler.js
  const entryPointPath = path.join(pkgDir, entryPoint)
  return { id: normalizePath(entryPointPath) }
}

function normalizePath(id) {
  return id.replace(/\\/g, '/')
}

module.exports = resolvePlugin
