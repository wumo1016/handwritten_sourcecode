const { normalizePath } = require('./utils')

async function resolveConfig() {
  const root = process.cwd()
  let config = {
    root: normalizePath(root)
  }
  return config
}

module.exports = resolveConfig
