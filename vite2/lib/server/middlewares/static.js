const static = require('serve-static')

function serverStaticMiddleware({ root }) {
  return static(root)
}

module.exports = serverStaticMiddleware
