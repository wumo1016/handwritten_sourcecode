const preAliasPlugin = require('./preAlias')
const resolvePlugin = require('./resolve')
const importAnalysisPlugin = require('./import-analysis')
/**
 * @Author: wyb
 * @Descripttion: 获取所有vite插件
 * @param {*} config
 * @param {*} userPlugins
 */
async function getAllPlugins(config) {
  return [
    preAliasPlugin(config),
    resolvePlugin(config),
    importAnalysisPlugin(config)
  ]
}
exports.getAllPlugins = getAllPlugins
