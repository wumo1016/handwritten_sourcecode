const connect = require('connect')

function createServer() {
  const app = connect()
  const server = {
    async listen(port, callback) {
      app.use((req, res, next) => {
        res.end('end')
      })
      require('http').createServer(app).listen(port, callback)
    }
  }
  return server
}

exports.createServer = createServer
