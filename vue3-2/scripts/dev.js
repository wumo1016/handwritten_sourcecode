const path = require('path')

// minimist 可以解析命令行参数
const args = require('minimist')(process.argv.slice(2)) // { _: [ 'reactivity' ], f: 'global' }
// 传入的需要打包的模块
const target = args._[0] || 'reactivity'
// 打包入口
const entry = path.resolve(__dirname, `../packages/${target}/src/index.ts`) // E:\wumo\handwritten_sourcecode\vue3-2\packages\reactivity\src\index.ts
// 传入的打包格式
const format = args.f || 'global'
// 打包格式处理
const outputFormat = format.startsWith('global')
  ? 'iife'
  : format === 'cjs'
  ? 'cjs'
  : 'esm'
// 打包后的文件
const outfile = path.resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
) // E:\wumo\handwritten_sourcecode\vue3-2\packages\reactivity\dist\reactivity.global.js

// 打包成 global(iife) 时全局变量的名字
const globalName = require(path.resolve(
  __dirname,
  `../packages/${target}/package.json`
))?.buildOptions?.name

const { build } = require('esbuild')

build({
  entryPoints: [entry],
  outfile,
  bundle: true, // 打包到一起
  sourcemap: true,
  format: outputFormat,
  globalName,
  platform: format === 'cjs' ? 'node' : 'browser',
  watch: {
    // 监控文件变化
    onRebuild(error) {
      if (!error) console.log(`重新打包`)
    }
  }
}).then(() => {
  console.log('watching~~~')
})
