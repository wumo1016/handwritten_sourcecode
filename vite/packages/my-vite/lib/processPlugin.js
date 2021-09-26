const koaStatic = require('koa-static')
const path = require('path')
const { readBody } = require('./utils.js')

function processPlugin({ app, root }) {
  const injection = `
  <script>
    window.process = { env: { NODE_NEV: 'development' } }
  </script>
  `
  app.use(async (ctx, next) => {
    await next()
    if (ctx.response.is('html')) {
      const html = await readBody(ctx.body)
      ctx.body = html.replace(/<\/head>/, `$&${injection}`)
    }
  })
}

module.exports = processPlugin
