const { isPlugin, slash } = require('wm-cli-utils')
const GeneratorAPI = require('./generatorApi')
const { writeFileTree } = require('./util')

/* 
 * targetDir：生成项目的目录地址
 * pkg：package.json文件配置
 * plugins：插件数组 [{ id, apply, options }]
 */

class Generator {
  constructor(targetDir, {
    pkg,
    plugins
  }) {
    this.targetDir = targetDir
    this.pkg = pkg
    this.plugins = plugins
    this.allPlugins = Object.keys(this.pkg.dependencies || {}).concat(Object.keys(this.pkg.devDependencies || {}))
    this.fileMiddlewares = [] // 插件中插入的函数
    this.files = [] // 先将需要生成的文件都放在里面
    this.cliService = plugins.find(p => p.id === '@vue/cli-service')
  }

  async initPlugins() {
    let rootOptions = this.cliService.options
    for (const plugin of this.plugins) {
      const { id, apply, options } = plugin
      let api = new GeneratorAPI(id, this, options, rootOptions)
      await apply(api, options)
    }
  }

  async resolveFiles() {
    for (const middleware of this.fileMiddlewares) {
      await middleware(this.files)
    }
  }

  normalizeFilePath(files) {
    Object.keys(files).forEach(path => {
      const normalizePath = slash(path)
      if (normalizePath !== path) {
        files[normalizePath] = files[path]
        delete files[path]
      }
    })
    return files
  }

  async generate() {
    console.log('开始生成文件和配置');
    await this.initPlugins() // 目的是修改pkg和fileMiddlewares
    // todo 提取pkg中的一些配置到单独的文件中去(babel eslint)
    // 执行fileMiddlewares中的函数
    await this.resolveFiles()
    // 格式化文件路径 \ => /
    this.files = this.normalizeFilePath(this.files)
    // 更新package.json文件
    this.files['package.json'] = JSON.stringify(this.pkg, null, 2)
    // TODO 重新npm install
    // 写入文件files
    await writeFileTree(this.targetDir, this.files)
  }

  hasPlugin(id, versionRange) {
    return [
      ...this.plugins.map(v => v.id),
      ...this.allPlugins
    ].some(v => v === id)
  }
}

module.exports = Generator