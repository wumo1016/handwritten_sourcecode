const Emitter = require('events')
const http = require('http')
const Stream = require('stream')

const context = require('./context')
const request = require('./request')
const response = require('./response')

class Application extends Emitter {

  constructor() {
    super()
    this.context = Object.create(context) // 应用隔离
    this.request = Object.create(request)
    this.response = Object.create(response)

    this.middlewares = []
  }

  compose(ctx) {
    let index = -1
    const dispach = (i) => {
      if (index >= i) return Promise.reject(new Error('next() call mutiple times'))
      index = i
      if (this.middlewares.length === i) return Promise.resolve()
      return Promise.resolve(this.middlewares[i](ctx, () => dispach(i + 1)))
    }
    return dispach(0)
  }

  createContext(req, res) {
    let ctx = Object.create(this.context) // 请求隔离
    let request = Object.create(this.request)
    let response = Object.create(this.response)

    ctx.request = request
    ctx.req = ctx.request.req = req

    ctx.response = response
    ctx.res = ctx.response.res = res

    res.statusCode = 404 // 设置默认状态为404

    this.compose(ctx).then(() => {
      let _body = ctx.body
      if (_body) {
        // 针对不同的类型做处理 因为res.end只能传递字符串或buffer
        if (typeof _body === 'string' || Buffer.isBuffer(_body)) {
          return res.end(_body)
        } else if (typeof _body === 'number') {
          return res.end(_body + '')
        } else if (_body instanceof Stream) {
          // 下载头
          res.setHeader('Content-Type', 'application/octet-stream')
          // 设置不识别的header 也会变成下载文件
          res.setHeader('Content-Disposition', 'attachment;filname=download')
          return _body.pipe(res)
        } else if (_body && typeof _body === 'object') {
          return res.end(JSON.stringify(_body))
        }
      } else {
        res.end('Not Found')
      }
    }).catch(err => {
      this.emit('error', err)
    })
  }

  handleRequest = (req, res) => {
    let ctx = this.createContext(req, res)
  }

  listen() {
    const server = http.createServer(this.handleRequest)
    server.listen(...arguments)
  }

  use(middleware) {
    this.middlewares.push(middleware)
  }
}

module.exports = Application