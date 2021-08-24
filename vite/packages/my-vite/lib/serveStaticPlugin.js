const koaStatic = require('koa-static')
const path = require('path')

function serveStaticPlugin({ app, root }) {
  // 添加静态目录
  app.use(koaStatic(root))
  app.use(koaStatic(path.join(root, 'public')))
}

module.exports = serveStaticPlugin
