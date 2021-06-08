const path = require('path')
const { getPromptModules } = require('./util/createTools')
const { defaults } = require('./options');
const inquirer = require('inquirer');
const isManualMode = answers => answers.preset === '__manual__';

// 创建项目
async function create(appName) {
  let cwd = process.cwd()
  let name = appName
  let targetDir = path.resolve(cwd, name)
  let promptModules = getPromptModules()
  const creator = new Creator(name, targetDir, promptModules)
  await creator.create()
}

class Creator {
  constructor(name, context, promptModules) {
    this.name = name
    this.context = context
    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts()
    this.presetPrompt = presetPrompt
    this.featurePrompt = featurePrompt
    this.injectedPrompts = []
    this.promptCompleteCbs = []
    const promptApi = new PromptModuleAPI(this)
    promptModules.forEach(m => m(promptApi))
  }
  async create() {
    let anwers = await this.promptAndResolvePresets()
    let preset
    if (anwers.preset && anwers.preset !== '__manual__') {
      preset = await this.resolvePresets(anwers.preset)
    } else {
      preset = {
        plugins: {}
      }
      anwers.features = anwers.features || []
      this.promptCompleteCbs.forEach(cb => cb(anwers, preset))
    }
    console.log(preset);
    return preset
  }
  resolvePresets(name) {
    return this.getPresets()[name]
  }
  async promptAndResolvePresets() {
    let anwers = await inquirer.prompt(this.resolveFinalPrompts())
    return anwers
  }
  resolveFinalPrompts() {
    this.injectedPrompts.forEach(prompt => {
      let originWhen = prompt.when || (() => true)
      prompt.when = anwers => {
        return isManualMode(anwers) && originWhen(anwers)
      }
    })
    let prompts = [
      this.presetPrompt,
      this.featurePrompt,
      ...this.injectedPrompts
    ]
    return prompts
  }
  getPresets() {
    return Object.assign({}, defaults)
  }
  resolveIntroPrompts() {
    let presets = this.getPresets()
    const presetChoices = Object.entries(presets).map(([name]) => {
      let displayName = name
      if (name === 'default') {
        displayName = 'Default'
      } else if (name === '__default_vue_3__') {
        displayName = 'Default (Vue 3)'
      }
      return {
        name: `${displayName}`,
        value: name
      }
    })
    const presetPrompt = {
      name: 'preset',//弹出项的名称 preset
      type: 'list',//如何选择 列表
      message: `Please pick a preset:`,//请选择一个预设
      choices: [
        ...presetChoices,
        {
          name: 'Manually select features',//手工选择特性
          value: '__manual__'
        }
      ]
    }
    const featurePrompt = {
      name: 'features',//弹出项的名称 features 手工选择的特性
      when: isManualMode,//如果when这个函数的返回值是true,就会弹出这个框，否则不弹这个框
      type: 'checkbox',//复选框
      message: 'Check the features needed for your project:',//手工你这个项目支持的特性
      choices: []
    }
    return { presetPrompt, featurePrompt }
  }
}

class PromptModuleAPI {
  constructor(creator) {
    this.creator = creator
  }
  injectFeature(feature) {
    this.creator.featurePrompt.choices.push(feature)
  }
  injectPrompt(prompt) {
    this.creator.injectedPrompts.push(prompt)
  }
  onPromptComplete(cb) {
    this.creator.promptCompleteCbs.push(cb)
  }
}

module.exports = (...args) => {
  return create(...args).catch(err => {
    console.log(err);
  })
}
