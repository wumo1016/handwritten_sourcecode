const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const chalk = require('chalk')
const {
  toShortPluginId
} = require('wm-cli-utils')

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

async function create(name, options) {
  let targetDir = path.resolve(process.cwd(), name)
  // 检查目标目录是否存在
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      const {
        action
      } = await inquirer.prompt([{
        name: 'action',
        type: 'list',
        message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
        choices: [{
            name: 'Overwrite',
            value: 'overwrite'
          },
          {
            name: 'Cancel',
            value: false
          }
        ]
      }])
      if (!action) {
        return
      } else if (action === 'overwrite') {
        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
        await fs.remove(targetDir)
      }
    }
  }
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
  // 配置 vue create 的选项框
  const presetPrompt = [{
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
  }]
  // 弹出选项
  let result = await inquirer.prompt(presetPrompt)
  console.log(result);
}

module.exports = create