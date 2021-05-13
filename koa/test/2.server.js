const Koa = require('../lib/application.js')
const fs = require('fs')

const app = new Koa()

app.use((ctx) => {
  ctx.body = 'hello'
  ctx.body = {
    name: 'wyb'
  }
  ctx.body = fs.createReadStream('./1.server.js')
})

app.listen(8080, () => {
  console.log('server start');
})