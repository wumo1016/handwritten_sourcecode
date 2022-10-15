const pathLib = require('path')
const resolve = require('resolve')
const fs = require('fs-extra')

/**
 * @Author: wyb
 * @Descripttion: 解析绝对路径的插件(既是一个vite插件也是一个rollup 插件)
 * @param {*} root
 */
function resolvePlugin({ root }) {
  return {
    name: 'resolve',
    resolveId(path, importer) {
      // 说明它是一个根目录下的绝对路径
      if (path.startsWith('/')) {
        return { id: pathLib.resolve(root, path.slice(1)) }
      }
      // 如果是绝对路径
      if (pathLib.isAbsolute(path)) {
        return { id: path }
      }
      // 如果是相对路径
      if (path.startsWith('.')) {
        const baseDir = importer ? pathLib.dirname(importer) : root
        const fsPath = pathLib.resolve(baseDir, path)
        return { id: fsPath }
      }
      // 如果是第三方
      const res = tryNodeResolve(path, importer, root)
      if (res) return res
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion: 解析第三方包绝对路径
 * @param {*} path
 * @param {*} importer
 * @param {*} root
 */
function tryNodeResolve(path, importer, root) {
  // 包的 package.json 文件位置
  const pkgPath = resolve.sync(`${path}/package.json`, { basedir: root }) // E:\wumo\handwritten_sourcecode\vite2-1-use\node_modules\vue\package.json
  // 包的目录位置
  const pkgDir = pathLib.dirname(pkgPath) // E:\wumo\handwritten_sourcecode\vite2-1-use\node_modules\vue
  // 读取 package.json 文件
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  // es的入口地址
  const entryPointPath = pathLib.join(pkgDir, pkg.module) // E:\wumo\handwritten_sourcecode\vite2-1-use\node_modules\vue\dist\vue.runtime.esm-bundler.js
  return { id: entryPointPath }
}

module.exports = resolvePlugin
