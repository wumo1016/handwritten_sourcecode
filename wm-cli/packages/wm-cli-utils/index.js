const pluginRE = /^(@vue\/|vue-|@[\w-]+(\.)?[\w-]+\/vue-)cli-plugin-/
// 获取插件的简称
exports.toShortPluginId = id => id.replace(pluginRE, '')