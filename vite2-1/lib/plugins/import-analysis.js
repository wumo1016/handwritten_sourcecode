const { init, parse } = require('es-module-lexer')
const MagicString = require('magic-string')

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} config
 */
function importAnalysisPlugin(config) {
  let server
  const { root } = config
  return {
    name: 'importAnalysis',
    configureServer(_server) {
      server = _server
    },
    async transform(source, id) {
      await init
      const [imports, exports] = parse(source)
      // console.log(imports)
      // console.log(exports)
      if (!imports.length) {
        return {
          code: source
        }
      }
      // 获取路径对应的模块
      const { moduleGraph } = server
      const currentModule = moduleGraph.getModuleById(id)
      // 此模块导入的子模块集合
      const importedUrls = new Set()
      // 此模块接收变更的依赖模块
      const acceptedUrls = new Set()

      const normalizeUrl = async (url) => {
        const resolved = await this.resolve(url, id)
        if (resolved && resolved.id.startsWith(root)) {
          url = resolved.id.slice(root.length)
        }
        await moduleGraph.ensureEntryFromUrl(url) // 建立此导入的模块和模块节点的对应关系
        return url
      }
      const ms = new MagicString(source)
      // import.meta.hot.accept 也会走到 imports 里面
      for (let index = 0, len = imports.length; index < len; index++) {
        const { s: start, e: end, n: specifier } = imports[index] // specifier => 模块名
        const rawUrl = source.slice(start, end)
        // import.meta.hot.accept(['./renderModule.js']
        if (rawUrl === 'import.meta') {
          const prop = source.slice(end, end + 4)
          if (prop === '.hot') {
            if (source.slice(end + 4, end + 11) === '.accept') {
              // lexAcceptedHmrDeps(source,
              //   source.indexOf('(', end + 11) + 1,
              //   acceptedUrls //此处存放的是原始的路径 相对的，也可能绝对的，也可以第三方的
              // );
            }
          }
        }
        if (specifier) {
          const url = await normalizeUrl(specifier) // 格式化成真实相对于项目的地址
          if (specifier !== url) {
            ms.overwrite(start, end, url)
          }
          importedUrls.add(url) // 添加依赖
        }
      }
      // console.log(importedUrls)
      return {
        code: ms.toString()
      }
    }
  }
}

module.exports = importAnalysisPlugin
