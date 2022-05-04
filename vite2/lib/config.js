const { normalizePath } = require('./utils')

async function resolveConfig() {
  // 执行脚本命令的目录 window \\ linux / 所以需要格式化
  const root = normalizePath(process.cwd())
  const config = { root }
  return config
}

module.exports = resolveConfig
