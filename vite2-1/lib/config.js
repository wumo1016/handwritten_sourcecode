const path = require('path')
const { normalizePath } = require('./utils')

async function resolveConfig() {
  const root = process.cwd()
  let config = {
    root: normalizePath(root),
    cacheDir: normalizePath(path.resolve('node_modules/.vite2_1'))
  }
  return config
}

module.exports = resolveConfig
