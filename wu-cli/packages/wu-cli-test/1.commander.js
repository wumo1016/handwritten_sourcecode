#!/usr/bin/env node

const program = require('commander');
program
  .version(`wu-cli 0.0.0}`) // 指定版本号
  .usage('<command> [options]') // 指定使用方式

program
  .command('create <app-name>') // 添加命令 <>表示必选参数
  .description('create a new project powered by vue-cli-service')
  .action((name) => {
    console.log(name);
  })

program.parse(process.argv)