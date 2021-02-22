import path from 'path'
import json from '@rollup/plugin-json'
import ts from 'rollup-plugin-typescript2'
import resolvePlugin from '@rollup/plugin-node-resolve'

// 根据环境变量中的TARGET(process.env.TARGET)属性 获取对应模块目录
const packageDir = path.resolve(__dirname, `packages/${process.env.TARGET}`)
const dirName = path.basename(packageDir) // 取文件名
// 获取对应模块目录里文件的方法
const resolve = p => path.resolve(packageDir, p)

// 先对打包类型做一个映射表 根据提供的formats格式化需要打包的内容
const outputConfig = {
  'esm': {
    file: resolve(`dist/${dirName}.esm.js`),
    format: 'es'
  },
  'cjs': {
    file: resolve(`dist/${dirName}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: resolve(`dist/${dirName}.global.js`),
    format: 'iife' // 立即执行函数
  },
}
// 获取package.json文件
const pkg = require(resolve('package.json'))
// 获取打包配置并处理
const buildOptions = pkg.buildOptions
const configs = buildOptions.formats.map(format => createConfig(format, outputConfig[format]))

function createConfig(format, output) {
  output.name = buildOptions.name
  // output.sourcemap = true // 生成sourcemap文件
  // 生成 rollup 配置
  return {
    input: resolve('src/index.ts'),
    output,
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      resolvePlugin() // 解析第三方模块
    ]
  }
}

export default configs