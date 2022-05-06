const { build } = require('esbuild')
const path = require('path')
const esbuildDepPlugin = require('./esbuildDepPlugin')

/**
 * @Author: wyb
 * @Descripttion: 扫描第三方依赖
 * @param {*}
 */
async function scanImports(config) {
  const deps = {} // key=>原始的模块名 value=>此模块的入口路径
  const esbuildScan = await esbuildDepPlugin(config, deps)
  await build({
    absWorkingDir: config.root,
    entryPoints: [path.resolve('index.html')],
    outfile: path.resolve('dist/main.js'),
    bundle: true, // 是否打包
    write: false, // 是否写入文件系统 否则直接写在内存中
    format: 'esm',
    plugins: [esbuildScan]
  })
  return deps
}

module.exports = scanImports
