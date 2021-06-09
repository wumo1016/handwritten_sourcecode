module.exports = creator => {
  // 添加自定义后的选项
  creator.injectChoice({
    name: 'Choose Vue version',
    value: 'vueVersion',
    description: 'Choose a version of Vue.js that you want to start the project with',
    checked: true
  })
  // 选了vueVersion之后添加新的提示选项
  creator.injectPrompt({
    name: 'vueVersion',
    when: answers => answers.features.includes('vueVersion'),
    message: 'Choose a version of Vue.js that you want to start the project with',
    type: 'list',
    choices: [
      {
        name: '2.x',
        value: '2'
      },
      {
        name: '3.x',
        value: '3'
      }
    ],
    default: '2'
  })
  // 选完提示框的回调
  creator.injectCompletePromptCbs((answers, preset) => {
    if (answers.vueVersion) {//给版本号赋值
      preset.vueVersion = answers.vueVersion
    }
  })
}