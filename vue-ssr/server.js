const Koa = require('koa')
const Router = require('koa-router')
const fs = require('fs')
const path = require('path')
const static = require('koa-static')

const VueServerRenderer = require('vue-server-renderer')

const app = new Koa()
const router = new Router()

const serverBundle = fs.readFileSync(path.resolve(__dirname, 'dist/server.bundle.js'), 'utf8')
const template = fs.readFileSync(path.resolve(__dirname, 'dist/server.html'), 'utf8')
const render = VueServerRenderer.createBundleRenderer(serverBundle, {
  template: template
})

// 这些写才能时样式生效
router.get('/', async (ctx) => {
  ctx.body = await new Promise((r, j) => {
    render.renderToString((err, html) => {
      if(err) j(err)
      r(html)
    })
  })

})

//当客户端发送请求时 会先去dist目录下查找
app.use(static(path.resolve(__dirname, 'dist')))
// 将路由注册到应用上
app.use(router.routes())
app.listen(3000)