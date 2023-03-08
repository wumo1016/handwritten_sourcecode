/* 
- semver: 版本相关 https://www.npmjs.com/package/semver
  - lt(v1, v2): v1 < v2
  - gte(v1, v2): v1 >= v2
*/

const { semver, execa } = require('@vue/cli-shared-utils')
const { executeCommand } = require('./util/executeCommand')

const PACKAGE_MANAGER_CONFIG = {
  npm: {
    install: ['install', '--loglevel', 'error']
  }
}

class PackageManager {
  constructor({ context } = {}) {
    this.context = context || process.cwd()
    this.bin = 'npm'
    this._registries = {}

    // npm 版本处理
    const MIN_SUPPORTED_NPM_VERSION = '6.9.0'
    const npmVersion = execa.sync('npm', ['--version']).stdout

    if (semver.lt(npmVersion, MIN_SUPPORTED_NPM_VERSION)) {
      throw new Error('NPM 版本太低啦，请升级')
    }

    if (semver.gte(npmVersion, '7.0.0')) {
      this.needsPeerDepsFix = true
    }
  }
  /**
   * @Author: wyb
   * @Descripttion:
   */
  async install() {
    const args = []
    // npm 版本大于7
    if (this.needsPeerDepsFix) {
      args.push('--legacy-peer-deps')
    }
    return await this.runCommand('install', args)
  }
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} command
   * @param {*} args
   */
  async runCommand(command, args) {
    await executeCommand(
      this.bin,
      [...PACKAGE_MANAGER_CONFIG[this.bin][command], ...(args || [])],
      this.context
    )
  }
  /* 最后调用 execa 的样子
  execa(
  'npm',
    ['install', '--loglevel', 'error', '--legacy-peer-deps'], 
    {
      cwd,
      stdio: ['inherit', 'inherit', 'inherit']
    }
  )
  */
}

module.exports = PackageManager
