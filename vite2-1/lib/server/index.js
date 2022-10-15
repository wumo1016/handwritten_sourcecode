const connect = require('connect')
const static = require('serve-static')
const resolveConfig = require('../config')
const { normalizePath } = require('../utils')

/**
 * @Author: wyb
 * @Descripttion: 创建服务器
 */
async function createServer() {
  const config = await resolveConfig()
  const app = connect()
  app.use(static(normalizePath(config.root))) // 设置静态文件中间件
  const server = {
    async listen(port, callback) {
      require('http').createServer(app).listen(port, callback)
    }
  }
  return server
}

exports.createServer = createServer
