// 只针对某个具体的模块打包

const fs = require('fs')
const execa = require('execa') // 开启子进程进行打包 最终还是使用rollup

// 要打包的模块名
const name = 'runtime-dom'

build(name)

async function build(target){
  // -c 表示采用配置文件
  // --environment表示设置环境变量
  await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], {
    stdio: 'inherit' // 将子进程打包的信息共享给父进程
  })
}
