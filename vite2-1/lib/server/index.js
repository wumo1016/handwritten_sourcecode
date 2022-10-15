const connect = require('connect')
const serverStatic = require('serve-static')
const { build } = require('esbuild')
const path = require('path')

const resolveConfig = require('../config')
const getScanPlugin = require('./scan-plugin')

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
      // 1.找到本项目中的第三方依赖
      const optimizeDeps = await createOptimizeDepsRun(config)

      require('http').createServer(app).listen(port, callback)
    }
  }
  return server
}
/**
 * @Author: wyb
 * @Descripttion: 分析项目依赖
 * @param {*} config
 */
async function createOptimizeDepsRun(config) {
  // 获取第三方依赖
  const deps = await scanImports(config)
  console.log(deps)
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
