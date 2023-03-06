const inquirer = require('inquirer')

/* 
- type: 表示类型
  - input: 输入框
  - list: 单选选项
  - checkbox: 多选选项
  - confirm: 表示确认项
- name: 表示键名
- default: 表示默认值
- message: 名称
*/
const arr = [
  {
    type: 'input',
    name: 'projectName',
    message: '项目名称',
    default: 'vue-demo'
  },
  {
    type: 'list',
    name: 'projectType',
    message: '项目类型',
    default: 'vue2',
    choices: [
      { name: 'vue2', value: 'vue2' },
      { name: 'vue3', value: 'vue3' },
      { name: 'react', value: 'react' }
    ]
  },
  {
    type: 'checkbox',
    name: 'plugins',
    message: '插件选择',
    choices: [
      { name: 'babel', value: 'babel' },
      { name: 'eslint', value: 'eslint' },
      { name: 'vue-router', value: 'vue-router' }
    ]
  },
  {
    type: 'confirm',
    name: 'confirm',
    message: 'confirm'
  }
]

inquirer
  .prompt(arr)
  .then((answers) => {
    console.log('==============')
    console.log(answers)
    /* 
    {
      projectName: 'test',
      projectType: 'vue3',
      plugins: [ 'eslint', 'vue-router' ],
      confirm: true
    }
    */
  })
  .catch((error) => {
    console.log('--------------')
    console.log(error)
  })
