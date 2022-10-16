const path = require('path')
const fs = require('fs-extra')
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

  //读取用户自己设置的插件
  const configFile = path.resolve(root, 'vite.config.js')
  const exists = await fs.pathExists(configFile)
  if (exists) {
    const userConfig = require(configFile)
    // 覆盖默认配置
    config = { ...config, ...userConfig }
  }
  // 获取所有插件
  config.plugins = await getAllPlugins(config, config.plugins || [])
  return config
}

module.exports = resolveConfig
