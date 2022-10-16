const path = require('path')
const { normalizePath } = require('./utils')
const { getAllPlugins } = require('./plugins')

/**
 * @Author: wyb
 * @Descripttion:
 */
async function resolveConfig() {
  const root = process.cwd()
  let config = {
    root: normalizePath(root),
    cacheDir: normalizePath(path.resolve('node_modules/.vite2_1'))
  }

  // 获取所有插件
  config.plugins = await getAllPlugins(config)
  return config
}

module.exports = resolveConfig
