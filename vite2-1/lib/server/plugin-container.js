const { normalizePath } = require('../utils')

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} plugins 插件数组
 * @param {*} root 根目录
 */
async function createPluginContainer({ plugins, root }) {
  const container = {
    async resolveId(path, importer) {
      for (const plugin of plugins) {
        if (!plugin.resolveId) continue
        const result = await plugin.resolveId.call(null, path, importer)
        if (result) {
          resolveId = result.id || result
          break
        }
      }
      return { id: normalizePath(resolveId) }
    },
    load() {},
    transform() {}
  }
  return container
}

module.exports = createPluginContainer
