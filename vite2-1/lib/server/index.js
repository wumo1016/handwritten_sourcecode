const connect = require('connect')
const serverStatic = require('serve-static')
const { build } = require('esbuild')
const path = require('path')
const fs = require('fs-extra')
const chokidar = require('chokidar')

const resolveConfig = require('../config')
const getScanPlugin = require('./scan-plugin')
const { normalizePath } = require('../utils')
const transformMiddleware = require('./middlewares/transform')
const createPluginContainer = require('./plugin-container')
const { createWebSocketServer } = require('./ws')
const { handleHMRUpdate } = require('./hmr')
const { ModuleGraph } = require('./moduleGraph')

/**
 * @Author: wyb
 * @Descripttion: 创建服务器
 */
async function createServer() {
  // 获取配置
  const config = await resolveConfig()
  // 创建服务器
  const app = connect()
  const http = require('http').createServer(app)
  // 创建 websocket
  const ws = createWebSocketServer(http, config)
  // 监听文件变化
  const watcher = chokidar.watch(path.resolve(config.root), {
    ignored: ['**/node_modules/**', '**/.git/**']
  })
  watcher.on('change', async (file) => {
    const normalizeFile = normalizePath(file)
    await handleHMRUpdate(normalizeFile, server)
  })
  // 模块依赖图
  const moduleGraph = new ModuleGraph((url) => pluginContainer.resolveId(url))
  // 创建插件容器
  const pluginContainer = await createPluginContainer(config)
  const server = {
    pluginContainer,
    ws,
    watcher,
    moduleGraph,
    async listen(port, callback) {
      /* 项目启动前进行 依赖预构建 */
      await runOptimize(config, server)
      http.listen(port, callback)
    }
  }
  for (const plugin of config.plugins) {
    if (plugin.configureServer) {
      plugin.configureServer(server)
    }
  }
  /* 拦截请求 重写导入路径 */
  app.use(transformMiddleware(server))
  /* 设置静态文件中间件 */
  app.use(serverStatic(config.root))
  return server
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} config
 * @param {*} server
 */
async function runOptimize(config, server) {
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
      format: 'esm',
      sourcemap: true,
      sourceRoot: depsCacheDir
    })
  }
  const existed = await fs.existsSync(depsCacheDir)
  if (!existed) {
    fs.mkdirsSync(depsCacheDir)
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
  // 将第三方依赖等保存到服务上 后面请求拦截的时候方便取值
  server._optimizeDepsMetadata = metadata
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
