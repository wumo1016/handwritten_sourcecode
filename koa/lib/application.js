const Emitter = require('events')
const http = require('http')

const context = require('./context')
const request = require('./request')
const response = require('./response')

class Application extends Emitter {

  constructor() {
    super()
    this.context = Object.create(context) // 应用隔离
    this.request = Object.create(request)
    this.response = Object.create(response)
  }

  createContext(req, res) {
    let ctx = Object.create(this.context) // 请求隔离
    let request = Object.create(this.request)
    let response = Object.create(this.response)

    ctx.request = request
    ctx.req = ctx.request.req = req

    this.fn(ctx)
  }

  handleRequest = (req, res) => {
    let ctx = this.createContext(req, res)
  }

  listen() {
    const server = http.createServer(this.handleRequest)
    server.listen(...arguments)
  }

  use(fn) {
    this.fn = fn
  }
}

module.exports = Application