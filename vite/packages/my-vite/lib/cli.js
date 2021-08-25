const Koa = require('koa')
const serveStaticPlugin = require('./serveStaticPlugin')
const moduleRewritePlugin = require('./moduleRewritePlugin')
const resolveModulePlugin = require('./resolveModulePlugin')
const processPlugin = require('./processPlugin')

function createServer() {
  const app = new Koa()
  const root = process.cwd()
  const context = { app, root }

  app.use((ctx, next) => {
    Object.assign(ctx, context)
    return next()
  })
  const resolvePlugins = [
    processPlugin,
    moduleRewritePlugin,
    serveStaticPlugin,
    resolveModulePlugin,
  ] // koa的中间件
  resolvePlugins.forEach(plugin => plugin(context))
  return app
}

createServer().listen(4000, () => {
  console.log('dev server is running at http://localhost:4000')
})
