const { WebSocketServer } = require('ws')
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} httpServer
 */
function createWebSocketServer(httpServer) {
  // websocket服务器可以和http服务器共享地址和端口 不需要自己创建服务器
  const wss = new WebSocketServer({ noServer: true })
  // 当HTTP服务器接收到客户端发出的升级协议请求的时候
  httpServer.on('upgrade', (req, client, head) => {
    // Sec-WebSocket-Protocol: vite-hmr
    if (req.headers['sec-websocket-protocol'] === 'vite-hmr') {
      // 把通信 协议从HTTP协议升级成websocket协议
      wss.handleUpgrade(req, client, head, (client) => {
        wss.emit('connection', client, req) // 连接成功
      })
    }
  })
  // 当服务器监听到客户端的连接 请求成功的时候
  wss.on('connection', (client) => {
    client.send(JSON.stringify({ type: 'connected' }))
  })
  return {
    on: wss.on.bind(wss), // 通过on方法可以监听客户端发过来的请求
    off: wss.off.bind(wss), // 取消监听客户端发过来的请求
    send(payload) {
      // 服务器向所有的客户端进行广播
      const stringified = JSON.stringify(payload)
      wss.clients.forEach((client) => {
        client.send(stringified)
      })
    }
  }
}
exports.createWebSocketServer = createWebSocketServer
