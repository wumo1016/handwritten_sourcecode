/*
 * @Description: 打包脚本
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-21 16:11:52
 */
import minimist from 'minimist'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import esbuild from 'esbuild'

// node中的命令函参数通过process 来获取 process.argv
const args = minimist(process.argv.slice(2))

// esm 使用commonjs 变量
const __filename = fileURLToPath(import.meta.url) // 获取文件的绝对路径 file: -> /usr
const __dirname = dirname(__filename) // 目录名
const require = createRequire(import.meta.url)
const target = args._[0] || 'reactivity' // 打包哪个项目
const format = args.f || 'iife' // 打包后的模块化规范

// 入口文件 根据命令行提供的路径来进行解析
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
const pkg = require(`../packages/${target}/package.json`)

// 根据需要进行打包
esbuild
  .context({
    entryPoints: [entry], // 入口
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), // 出口
    bundle: true, // reactivity -> shared  会打包到一起
    platform: 'browser', // 打包后给浏览器使用
    sourcemap: true, // 可以调试源代码
    format, // cjs esm iife
    globalName: pkg.buildOptions?.name
  })
  .then(ctx => {
    console.log('start dev')
    return ctx.watch() // 监控入口文件持续进行打包处理
  })
