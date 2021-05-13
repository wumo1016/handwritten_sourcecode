const Koa = require('../lib/application.js')

const app = new Koa()

app.use((ctx) => {
  ctx.body('hello')
})

app.listen(8080, () => {
  console.log('server start');
})
