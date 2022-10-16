const resolvePlugin = require('./resolve')
/**
 * @Author: wyb
 * @Descripttion: 获取所有vite插件
 * @param {*} config
 * @param {*} userPlugins
 */
async function getAllPlugins(config) {
  return [resolvePlugin(config)]
}
exports.getAllPlugins = getAllPlugins
