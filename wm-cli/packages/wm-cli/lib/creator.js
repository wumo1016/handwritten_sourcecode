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
const featurePrompt = [
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
]

async function resolveFinalPrompts() {
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

  return [
    presetPrompt,
    featurePrompt
  ]
}

module.exports = class Creator {
  constructor(name, targetDir) {}

  async create(options) {
    // 弹出选项
    let result = await inquirer.prompt(await resolveFinalPrompts())
    // 选择默认的结果   { preset: 'default' }
    // 选择自定义的结果 { preset: '__manual__', features: [] }
    console.log(result);
  }
}