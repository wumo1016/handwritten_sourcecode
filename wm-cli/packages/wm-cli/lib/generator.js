const { isPlugin } = require('wm-cli-utils')
const Generator = require('./generatorApi')

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
    this.files = [] // 先将需要生成的文件都放在里面
    this.fileMiddlewares = []
    this.cliService = plugins.find(p => p.id === '@vue/cli-service')
  }

  async initPlugins(){
    let rootOptions = this.cliService.options
    for (const plugin of this.plugins) {
      const { id, apply, options } = plugin
      let api = new Generator(ip, this, options, rootOptions)
      await apply(api, options)
    }
    console.log(rootOptions);
  }

  async generate(){
    console.log('开始生成文件和配置');
    await this.initPlugins() // 目的是修改pkg和fileMiddlewares
    // todo 提取pkg中的一些配置到单独的文件中去(babel eslint)
    // 解析文件路径 \ => /
    // 更新package.json文件
    // 重新npm install
    // 写入文件files
  }
}

module.exports = Generator