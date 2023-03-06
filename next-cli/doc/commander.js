const { program } = require('commander')

program
  .name('next-cli') // 名称
  .description('这是一个脚手架') // 描述
  .version('0.0.1') // 版本
  .usage('<command> [options]') // 用法提示

program
  .command('createPage') // 创建命令
  .description('生成一个页面') // 命令描述
  .argument('<name>', '名称') // <name> 表 name 为必填
  .action((name) => {
    // 输入该命令的动作，逻辑实现。
    console.log(`新建了一个文件：${name}`)
  })

program.parse()

// node commander -h
// node main.js createPage index.vue
