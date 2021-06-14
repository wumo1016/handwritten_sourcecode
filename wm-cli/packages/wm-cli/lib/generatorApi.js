const path = require('path')
const globby = require('globby')
const {
  isString,
  toShortPluginId
} = require('wm-cli-utils')
// 提取调用此函数的目录
function extractCallDir() {
  // extract api.render() callsite file location using error stack
  const obj = {}
  Error.captureStackTrace(obj)
  const callSite = obj.stack.split('\n')[3]

  // the regexp for the stack when called inside a named function
  const namedStackRegExp = /\s\((.*):\d+:\d+\)$/
  // the regexp for the stack when called inside an anonymous
  const anonymousStackRegExp = /at (.*):\d+:\d+$/

  let matchResult = callSite.match(namedStackRegExp)
  if (!matchResult) {
    matchResult = callSite.match(anonymousStackRegExp)
  }

  const fileName = matchResult[1]
  return path.dirname(fileName)
}

/**
 * @param id 插件id
 * @param generator 生成器函数
 * @param options 插件的选项
 * @param rootOptions 根选项 就是预设
 */

class GeneratorAPI {
  constructor(id, generator, options, rootOptions) {
    this.id = id
    this.generator = generator
    this.options = options
    this.rootOptions = rootOptions
    this.pluginData = generator.plugins.filter(v => v !== '@vue/cli-service')
      .map(v => ({ name: toShortPluginId(id) })) // 
  }

  /**
   * @param source 模板路径
   * @param addtionalData 额外的数据对象
   */

  _injectFileMiddleware(middleware) {
    this.generator.fileMiddlewares.push(middleware)
  }

  render(source, addtionalData) {
    const baseDir = extractCallDir()
    if (isString(source)) {
      // G:\wumo\handwritten_sourcecode\test\node_modules\_@vue_cli-service@4.5.13@@vue\cli-service\generator\template
      source = path.resolve(baseDir, source)
      this._injectFileMiddleware(async (files) => {
        const data = Object.assign({
          options: this.options, // 插件自己的配置对象
          rootOptions: this.rootOptions, // 预设配置
          plugins: this.pluginData
        }, addtionalData)
        const _files = await globby(['**/*'], { cwd: source }) // 找到目标文件夹下的所有文件
        // console.log(_files, 123456);
        // 将_gitignore文件处理成.gitignore文件
        for (const rawPath of _files) {
          
        }
      })
    }
  }

  extendPackage() {

  }

  hasPlugin() {

  }
}

module.exports = GeneratorAPI