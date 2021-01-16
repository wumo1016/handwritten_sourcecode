const Koa = require('koa')
const Router = require('koa-router')
const fs = require('fs')
const path = require('path')

const Vue = require('vue')
const VueServerRenderer = require('vue-server-renderer')

const vm = new Vue({
  template: '<div>hello {{name}}</div>',
  data: {
    name: 'wyb'
  },
})

const app = new Koa()
const router = new Router()

const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf8')

router.get('/', async (ctx) => {
  // 当用户访问的时候 需要将渲染的字符串插入到模板中
  ctx.body = await VueServerRenderer.createRenderer({
    template
  }).renderToString(vm)
})

// 将路由注册到应用上
app.use(router.routes())

app.listen(3000)