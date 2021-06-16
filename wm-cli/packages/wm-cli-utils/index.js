const pluginRE = /^(@vue\/|vue-|@[\w-]+(\.)?[\w-]+\/vue-)cli-plugin-/;

['module', 'pluginResolution'].forEach(m => {
  Object.assign(exports, require(`./lib/${m}`))
})

// 获取插件的简称
exports.toShortPluginId = id => id.replace(pluginRE, '')
// 检测是否是插件
exports.isPlugin = id => pluginRE.test(id)

exports.isString = value => typeof value === 'string'

exports.isObject = value => Object.prototype.toString.call(value) === "[object Object]"

exports.slash = path => {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path); // eslint-disable-line no-control-regex
  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }
  return path.replace(/\\/g, '/');
}