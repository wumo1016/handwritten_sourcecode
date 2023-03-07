const inquirer = require('inquirer')
const PromptModuleAPI = require('./PromptModuleAPI')
const { defaults } = require('./util/preset')
const { getPromptModules } = require('./util/prompt')

class Creator {
  constructor(name, context) {
    // 项目名称
    this.name = name
    // 项目路径，含名称
    this.context = process.env.VUE_CLI_CONTEXT = context
    // package.json 数据
    this.pkg = {}
    // 包管理工具
    this.pm = null
    // 预设提示
    this.presetPrompt = this.resolvePresetPrompts()
    // 自定义提示
    this.featurePrompt = this.resolveFeaturePrompts()
    // 保存相关提示
    this.outroPrompts = this.resolveOutroPrompts()
    // 其他提示选项
    this.injectedPrompts = []
    // 回调
    this.promptCompleteCbs = []

    const promptModule = new PromptModuleAPI(this)
    const prompts = getPromptModules()
    prompts.map((fn) => fn(promptModule))

    inquirer.prompt(this.resolveFinalPrompts()).then((res) => {
      console.log(res)
    })
  }
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} cliOptions
   * @param {*} preset
   */
  async create(cliOptions = {}, preset = null) {
    // 处理用户输入
    // const preset = await this.promptAndResolvePreset()
    // // 初始化安装环境
    // await this.initPackageManagerEnv(preset)
    // // 生成项目文件，生成配置文件
    // const generator = await this.generate(preset)
    // // 生成 readme 文件
    // await this.generateReadme(generator)
    // this.finished()
  }
  /**
   * @Author: wyb
   * @Descripttion: 最终预设
   */
  resolveFinalPrompts() {
    const prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.outroPrompts,
      ...this.injectedPrompts
    ]
    return prompts
  }
  /**
   * @Author: wyb
   * @Descripttion: 默认预设
   */
  resolvePresetPrompts() {
    const presetChoices = Object.entries(defaults.presets).map(
      ([name, preset]) => {
        return {
          // name: `${name}(${Object.keys(preset.plugins).join(', ')})`, // 将预设的插件放到提示
          name, // 将预设的插件放到提示
          value: name
        }
      }
    )
    return {
      name: 'preset', // preset 记录用户选择的选项值。
      type: 'list', // list 表单选
      message: `Please pick a preset:`,
      choices: [
        ...presetChoices, // Vue2 默认配置，Vue3 默认配置
        {
          name: 'Manually select features', // 手动选择配置，自定义特性配置
          value: '__manual__'
        }
      ]
    }
  }
  /**
   * @Author: wyb
   * @Descripttion: 自定义特性复选框
   */
  resolveFeaturePrompts() {
    return {
      name: 'features', // features 记录用户选择的选项值。
      when: (answers) => answers.preset === '__manual__', // 当选择"Manually select features"时，该提示显示
      type: 'checkbox',
      message: 'Check the features needed for your project:',
      choices: [], // 复选框值，待补充
      pageSize: 10
    }
  }
  /**
   * @Author: wyb
   * @Descripttion: 保存相关提示
   */
  resolveOutroPrompts() {
    const outroPrompts = [
      // 配置保存在哪里
      {
        name: 'useConfigFiles',
        when: (answers) => answers.preset === '__manual__',
        type: 'list',
        message: 'Where do you prefer placing config for Babel, ESLint, etc.?',
        choices: [
          {
            name: 'In dedicated config files',
            value: 'files'
          },
          {
            name: 'In package.json',
            value: 'pkg'
          }
        ]
      },
      // 是否保存预设
      {
        name: 'save',
        when: (answers) => answers.preset === '__manual__',
        type: 'confirm',
        message: 'Save this as a preset for future projects?',
        default: false
      },
      // 保存预设名称
      {
        name: 'saveName',
        when: (answers) => answers.save,
        type: 'input',
        message: 'Save preset as:'
      }
    ]
    return outroPrompts
  }
}

module.exports = Creator
