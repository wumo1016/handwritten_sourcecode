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
    const cliService = plugins.find(p => p.id === '@vue/cli-service')
  }

  async generate(){
    console.log('开始生成文件和配置');
  }
}

module.exports = Generator