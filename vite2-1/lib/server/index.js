const connect = require('connect')
const serverStatic = require('serve-static')
const { build } = require('esbuild')
const path = require('path')
const fs = require('fs-extra')

const resolveConfig = require('../config')
const getScanPlugin = require('./scan-plugin')
const { normalizePath } = require('../utils')

/**
 * @Author: wyb
 * @Descripttion: 创建服务器
 */
async function createServer() {
  const config = await resolveConfig()
  const app = connect()
  app.use(serverStatic(config.root)) // 设置静态文件中间件
  const server = {
    async listen(port, callback) {
      /* 项目启动前进行 依赖预构建 */
      const optimizeDeps = await getOptimizeDeps(config, server)

      require('http').createServer(app).listen(port, callback)
    }
  }
  return server
}
/**
 * @Author: wyb
 * @Descripttion: 分析项目依赖
 * @param {*} config
 * @param {*} server
 */
async function getOptimizeDeps(config, server) {
  /* 1.找到本项目中的第三方依赖 */
  const deps = await scanImports(config)
  /* 2.预构建 */
  const metadata = {
    optimized: {}
  }
  const depsCacheDir = path.resolve(config.cacheDir, 'deps') // E:\wumo\handwritten_sourcecode\vite2-1-use\node_modules\.vite2_1\deps
  const metaDataPath = path.join(depsCacheDir, '_metadata.json') // E:\wumo\handwritten_sourcecode\vite2-1-use\node_modules\.vite2_1\deps\_metadata.json
  for (const id in deps) {
    const file = path.resolve(depsCacheDir, id + '.js')
    metadata.optimized[id] = {
      src: deps[id],
      file
    }
    // 将依赖文件及其子依赖全部打包进一个文件
    await build({
      absWorkingDir: config.root,
      entryPoints: [deps[id]],
      outfile: file, // 打包后写入的路径
      bundle: true,
      write: true,
      format: 'esm'
    })
  }
  // 写入metadata文件
  await fs.writeFile(
    metaDataPath,
    JSON.stringify(metadata, (key, value) => {
      if (key === 'file' || key === 'src') {
        return normalizePath(path.relative(depsCacheDir, value)) // 将路径格式化为相对路径
      }
      return value
    })
  )
  // 将第三方依赖等保存
  server._optimizeDepsMetadata = metadata
  return deps
}
/**
 * @Author: wyb
 * @Descripttion: 扫描第三方依赖
 * @param {*} config
 */
async function scanImports(config) {
  // 此入存放依赖导入
  const depImports = {}
  // 创建一个esbuild的扫描插件
  const scanPlugin = await getScanPlugin(config, depImports)
  // 使用esbuild进行处理
  await build({
    absWorkingDir: config.root, // 当前的工作目录
    entryPoints: [path.resolve('./index.html')], // 指定编译的入口
    bundle: true, // 打包
    format: 'esm', // 输出文件俄式
    outfile: './dist/bundle.js',
    write: true, // 真实情况 write: false，不需要写入硬盘
    plugins: [scanPlugin]
  })

  return depImports
}

exports.createServer = createServer
