const Koa = require('../lib/application')

const app = new Koa()

// 所有use中的函数 都必须添加async await 因为不知道后面是否会出现异步操作
app.use(async (ctx, next) => {
  console.log(1);
  await next()
  console.log(2);
  ctx.body = 'wyb'
})

app.use(async (ctx, next) => {
  console.log(3);
  await next()
  console.log(4);
})

app.use(async (ctx, next) => {
  console.log(5);
  await next()
  console.log(6);
})

app.listen(3000, () => {
  console.log('server start');
})

app.on('error', function (err) {
  console.log('err', err);
})