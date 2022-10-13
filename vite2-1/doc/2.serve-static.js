const connect = require('connect')
const static = require('serve-static')
const http = require('http')

const app = connect()
app.use(static(__dirname))

http.createServer(app).listen(3000, () => console.log('3000'))
