#!/usr/bin/env node

const program = require('commander')

// 设置版本
program.version('wu-cli 0.0.1') // 对应命令`wm -V`
program.version('wu-cli 0.0.1', '-v, --version') // 对应命令`wm -v`

// 创建命令
program
  .command('create <name>')
  .description('create a new project')
  .action(name => {
    require('../lib/create')(name)
  })

program.parse(process.argv)
