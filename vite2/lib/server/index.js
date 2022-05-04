const http = require('http')
const connect = require('connect')
const resolveConfig = require('../config')
const serverStaticMiddleware = require('./middlewares/static')

async function createServer() {
  const config = await resolveConfig('../config.js')
  const middlewares = connect()
  middlewares.use(serverStaticMiddleware(config))
  const server = {
    async listen(port) {
      http.createServer(middlewares).listen(port, async () => {
        console.log(`server running at http://localhost:${port}`)
      })
    }
  }
  return server
}

exports.createServer = createServer
