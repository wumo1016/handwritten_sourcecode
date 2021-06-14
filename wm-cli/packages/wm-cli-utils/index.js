const pluginRE = /^(@vue\/|vue-|@[\w-]+(\.)?[\w-]+\/vue-)cli-plugin-/;

['module', 'pluginResolution'].forEach(m => {
  Object.assign(exports, require(`./lib/${m}`))
})

// 获取插件的简称
exports.toShortPluginId = id => id.replace(pluginRE, '')
// 检测是否是插件
exports.isPlugin = id => pluginRE.test(id)

exports.isString = value => typeof value === 'string'


