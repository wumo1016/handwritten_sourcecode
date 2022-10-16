const { normalizePath } = require('../utils')

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} plugins 插件数组
 * @param {*} root 根目录
 */
async function createPluginContainer({ plugins, root }) {
  class PluginContext {
    async resolve(id, importer) {
      return await container.resolveId(id, importer)
    }
  }
  const container = {
    async resolveId(path, importer) {
      const ctx = new PluginContext()
      for (const plugin of plugins) {
        if (!plugin.resolveId) continue
        const result = await plugin.resolveId.call(ctx, path, importer)
        if (result) {
          resolveId = result.id || result
          break
        }
      }
      return { id: normalizePath(resolveId) }
    },
    async load(id) {
      const ctx = new PluginContext()
      for (const plugin of plugins) {
        if (!plugin.load) continue
        const result = await plugin.load.call(ctx, id)
        if (result) return result
      }
    },
    async transform(code, id) {
      const ctx = new PluginContext()
      for (const plugin of plugins) {
        if (!plugin.transform) continue
        const result = await plugin.transform.call(ctx, code, id)
        if (!result) {
          continue
        } else {
          code = result.code || result
        }
      }
      return { code }
    }
  }
  return container
}

module.exports = createPluginContainer
