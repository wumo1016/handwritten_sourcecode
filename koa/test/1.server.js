const Koa = require('../lib/application.js')

const app = new Koa()

app.use((ctx) => {
  console.log(ctx.req.url);
  console.log(ctx.request.req.url);
  console.log(ctx.request.url);
  console.log(ctx.query);
})

app.listen(8080, () => {
  console.log('server start');
})
