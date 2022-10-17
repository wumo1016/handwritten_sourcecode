/**
 * @Author: wyb
 * @Descripttion: 替换源码中的变量
 * @param {*} config
 */
function definePlugin(config) {
  return {
    name: 'define',
    transform(code) {
      const replacements = config.define || {}
      for (let key in replacements) {
        code = code.replace(new RegExp(key, 'g'), replacements[key])
      }
      return code
    }
  }
}
module.exports = definePlugin
