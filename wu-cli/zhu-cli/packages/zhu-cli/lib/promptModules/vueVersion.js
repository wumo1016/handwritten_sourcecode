module.exports = cli => {
  //插入新的特性
  cli.injectFeature({
    name: 'Choose Vue version',
    value: 'vueVersion',
    description: 'Choose a version of Vue.js that you want to start the project with',
    checked: true
  })
  //插入新的提示选项
  cli.injectPrompt({
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
  //选完提示框的回调
  cli.onPromptComplete((answers, result) => {
    if (answers.vueVersion) {//给版本号赋值
      result.vueVersion = answers.vueVersion
    }
  })
}
