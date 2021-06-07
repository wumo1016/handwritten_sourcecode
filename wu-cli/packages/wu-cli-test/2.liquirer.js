const inquirer = require('inquirer')
const isManualMode = answers => answers.preset === '__manual__';
let defaultPreset = { // 默认预设
  useConfigFiles: false, // 是否将eslint、babel等放入单独的文件
  cssPreprocessor: undefined, // 默认不配置css预处理器
  plugins: {
    '@vue/cli-plugin-babel': {},
    '@vue/cli-plugin-eslint': {
      config: 'base',
      lintOn: ['save']
    }
  }
}
let presets = {
  'default': Object.assign({
    vueVersion: '2'
  }, defaultPreset),
  '__default_vue_3__': Object.assign({
    vueVersion: '3'
  }, defaultPreset)
}
const presetChoices = Object.entries(presets).map(([name, preset]) => {
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
  name: 'preset', // 弹出项的名称
  type: 'list', // 如何选择
  message: `Please pick a preset:`,
  choices: [
    ...presetChoices,
    {
      name: 'Manually select features',
      value: '__manual__'
    }
  ]
}
let features = [
  'vueVersion',
  'babel',
  'typescript',
  'pwa',
  'router',
  'vuex',
  'cssPreprocessors',
  'linter',
  'unit',
  'e2e'
];
const featurePrompt = {
  name: 'features',
  when: isManualMode, // 如果值为true就会进入这个弹框
  type: 'checkbox', // 多选
  message: 'Check the features needed for your project:',
  choices: features,
  // pageSize: 10
}
const prompts = [
  presetPrompt, // 描述如何选择预设
  featurePrompt // 描述如何选择自定义的功能
]

;
(async function () {
  let result = await inquirer.prompt(prompts);
  console.log(result);
  /* 
  {
    preset: '__manual__',
    features: [ 'vueVersion', 'babel', 'typescript', 'router', 'vuex' ]
  }
  */
})();