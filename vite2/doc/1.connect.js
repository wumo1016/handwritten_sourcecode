const connect = require('connect')
const http = require('http')

// 中间件
const middlewares = connect()

middlewares.use(function (req, res, next) {
  console.log('middleware1')
  next()
})
middlewares.use(function (req, res, next) {
  console.log('middleware2')
  next()
})
middlewares.use(function (req, res, next) {
  res.end('Hello from Connect!')
})

http.createServer(middlewares).listen(3000)
