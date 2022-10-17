const preAliasPlugin = require('./preAlias')
const resolvePlugin = require('./resolve')
const importAnalysisPlugin = require('./import-analysis')
const definePlugin = require('./define')
/**
 * @Author: wyb
 * @Descripttion: 获取所有vite插件
 * @param {*} config
 * @param {*} userPlugins
 */
async function getAllPlugins(config, userPlugins) {
  return [
    preAliasPlugin(config),
    resolvePlugin(config),
    ...userPlugins,
    definePlugin(config),
    importAnalysisPlugin(config)
  ]
}
exports.getAllPlugins = getAllPlugins
