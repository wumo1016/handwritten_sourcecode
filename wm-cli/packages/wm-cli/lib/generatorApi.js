const path = require('path')
const globby = require('globby')
const fs = require('fs-extra')
const { isBinaryFileSync } = require('isbinaryfile')
const ejs = require('ejs')
const {
  isString,
  toShortPluginId,
  isObject
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
          const targetPath = rawPath.split('/').map(field => {
            if (field.charAt(0) == '_') {
              return `.${field.slice(1)}`
            }
            return field
          }).join('/')
          const sourcePath = path.resolve(source, rawPath)
          const content = this.renderFile(sourcePath, data)
          files[targetPath] = content
        }
      })
    }
  }
  // 解析文件内容
  renderFile(path, data) {
    if (isBinaryFileSync(path)) { // 判断是否是二进制文件
      return fs.readFileSync(path)
    }
    let template = fs.readFileSync(path, 'utf8')
    return ejs.render(template, data)
  }
  // 扩展package.json文件
  extendPackage(fields) {
    const pkg = this.generator.pkg
    const toMerge = fields
    for (const key in toMerge) {
      const value = toMerge[key]
      let existing = pkg[key]
      if (isObject(existing) && ['devDependencies', 'dependencies'].includes(key)) {
        pkg[key] = Object.assign(existing || {}, value)
      } else { // TODO 其他有的也需要合并
        pkg[key] = value
      }
    }
  }

  hasPlugin(id, versionRange) {
    return this.generator.hasPlugin(id, versionRange)
  }
}

module.exports = GeneratorAPI