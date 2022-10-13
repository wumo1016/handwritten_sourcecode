const connect = require('connect')
const http = require('http')
// connect=>express=>koa
const app = connect()
app.use((req, res, next) => {
  console.log('中间件1')
  next()
})
app.use((req, res, next) => {
  console.log('中间件2')
  next()
})
app.use((req, res, next) => {
  res.end('end')
})
http.createServer(app).listen(3000)
