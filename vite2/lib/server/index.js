const http = require('http')
const connect = require('connect')
const resolveConfig = require('../config')
const serverStaticMiddleware = require('./middlewares/static')
const { createOptimizerDepsRun } = require('../optimizer')

/**
 * @Author: wyb
 * @Descripttion: 创建http服务
 * @param {*}
 */
async function createServer() {
  const config = await resolveConfig('../config.js')
  const middlewares = connect()
  middlewares.use(serverStaticMiddleware(config))
  const server = {
    async listen(port) {
      await runOptimize(config)
      http.createServer(middlewares).listen(port, async () => {
        console.log(`server running at http://localhost:${port}`)
      })
    }
  }
  return server
}

async function runOptimize(config) {
  await createOptimizerDepsRun(config)
}

exports.createServer = createServer
