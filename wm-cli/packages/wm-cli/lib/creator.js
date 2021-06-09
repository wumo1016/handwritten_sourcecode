const chalk = require('chalk')
const inquirer = require('inquirer')
const {
  toShortPluginId
} = require('wm-cli-utils')
const isManualMode = answers => answers.preset === '__manual__'

// 内置预设基础配置
const defaultPreset = {
  useConfigFiles: false,
  cssPreprocessor: undefined,
  plugins: {
    '@vue/cli-plugin-babel': {},
    '@vue/cli-plugin-eslint': {
      config: 'base',
      lintOn: ['save']
    }
  }
}
// 内置预设
const defaultPresets = {
  'default': {
    vueVersion: '2',
    ...defaultPreset
  },
  '__default_vue_3__': {
    vueVersion: '3',
    ...defaultPreset
  }
}
// 处理vue create的选项信息
function formatPluginName(preset) {
  // 添加版本信息
  const versionInfo = chalk.yellow(`[Vue${preset.vueVersion}] `)
  // 添加插件信息
  const plugins = []
  if (preset.router) {
    plugins.push('router')
  }
  if (preset.vuex) {
    plugins.push('vuex')
  }
  if (preset.cssPreprocessor) {
    features.push(preset.cssPreprocessor)
  }
  plugins.push.apply(plugins, Object.keys(preset.plugins))
  return versionInfo + plugins.map(name => {
    name = toShortPluginId(name)
    return chalk.yellow(name)
  }).join(', ')
}
// 自定义功能模块选择
const featureList = [
  'vueVersion',
  // 'babel',
  // 'typescript',
  // 'pwa',
  // 'router',
  // 'vuex',
  // 'cssPreprocessors',
  // 'linter',
  // 'unit',
  // 'e2e'
].map(file => require(`./promptModules/${file}`))
// 获取vue create和选择自定义之后的选项
function resolveDefaultPrompts() {
  // 配置 vue create 的选项
  const presetChoices = Object.entries(defaultPresets).map(([name, preset]) => {
    let displayName = name
    if (name === 'default') {
      displayName = 'Default'
    } else if (name === '__default_vue_3__') {
      displayName = 'Default (Vue 3)'
    }
    return {
      name: `${displayName} (${formatPluginName(preset)})`,
      value: name
    }
  })

  const presetPrompt = {
    name: 'preset',
    type: 'list',
    message: 'please pick a preset',
    choices: [
      ...presetChoices,
      {
        name: 'Manually select features',
        value: '__manual__'
      }
    ],
  }
  // 配置选择自定义之后的选项
  const featurePrompt = {
    name: 'features',
    when: isManualMode,
    type: 'checkbox',
    message: 'Check the features needed for your project:',
    choices: [],
    pageSize: 10
  }

  return {
    presetPrompt,
    featurePrompt
  }
}

module.exports = class Creator {
  constructor(name, targetDir) {
    const {
      presetPrompt,
      featurePrompt
    } = resolveDefaultPrompts()
    this.presetPrompt = presetPrompt // vue create选项
    this.featurePrompt = featurePrompt // 选择自定义后的选项
    this.injectedPrompt = [] // 后续需要插入的选项
    this.promptCompleteCbs = [] // 选择完成后的回调数组

    // 添加choices prompt 回调等
    featureList.map(fn => fn(this))

  }
  
  injectChoice(choice) {
    this.featurePrompt.choices.push(choice)
  }

  injectPrompt(prompt) {
    this.injectedPrompt.push(prompt)
  }

  injectCompletePromptCbs(cb) {
    this.promptCompleteCbs.push(cb)
  }

  async resolveFinalPrompts() {
    // 应该先处理一下插入的选项 如果选择的不是自定义 就没有features
    // 只有选择自定义了 再走自己的when
    this.injectedPrompt.forEach(prompt => {
      const originWhen = prompt.when || (() => true)
      prompt.when = aswers => {
        return isManualMode(aswers) && originWhen(aswers)
      }
    })

    return [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompt
    ]
  }

  async create(options) {
    // 弹出选项
    let anwers = await inquirer.prompt(await this.resolveFinalPrompts())
    // 选择默认的结果   { preset: 'default' }
    // 选择自定义的结果 { preset: '__manual__', features: [] }
    let preset
    if (anwers.preset === '__manual__') { // 如果选的是自定义
      preset = { plugins: {} }
      this.promptCompleteCbs.map(cb => cb(anwers, preset))
    } else {
      preset = defaultPresets[anwers.preset]
    }
    console.log(preset);

  }
}