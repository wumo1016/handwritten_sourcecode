const { init, parse } = require('es-module-lexer')
const MagicString = require('magic-string')

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} config
 */
function importAnalysisPlugin(config) {
  const { root } = config
  return {
    name: 'importAnalysis',
    async transform(source, importer) {
      await init
      const imports = parse(source)[0]
      if (!imports.length) {
        return {
          code: source
        }
      }
      const normalizeUrl = async (url) => {
        const resolved = await this.resolve(url, importer)
        if (resolved && resolved.id.startsWith(root)) {
          url = resolved.id.slice(root.length)
        }
        return url
      }
      const ms = new MagicString(source)
      for (let index = 0, len = imports.length; index < len; index++) {
        const { s: start, e: end, n: specifier } = imports[index] // specifier => 模块名
        if (specifier) {
          const url = await normalizeUrl(specifier) // 格式化成真实相对于项目的地址
          if (specifier !== url) {
            ms.overwrite(start, end, url)
          }
        }
      }
      return {
        code: ms.toString()
      }
    }
  }
}

module.exports = importAnalysisPlugin
