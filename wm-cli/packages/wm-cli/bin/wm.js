#!/usr/bin/env node

const program = require('commander')

// 设置版本
program.version('wu-cli 0.0.1') // 对应命令`wm -V`
program.version('wu-cli 0.0.1', '-v, --version') // 对应命令`wm -v`

// 创建命令
program
  .command('create <name>')
  .description('create a new project')
  .option('-f, --force', 'Overwrite target directory if it exists') // 覆盖以及存在的目录
  .action((name, options) => {
    require('../lib/create')(name, options)
  })

program.parse(process.argv)
