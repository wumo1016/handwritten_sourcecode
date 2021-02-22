// 把packages下所有模块打包

const fs = require('fs')
const execa = require('execa') // 开启子进程进行打包 最终还是使用rollup

// 获取packages下的所有目录
const targets = fs.readdirSync('packages').filter(f => fs.statSync(`packages/${f}`).isDirectory()) // 只读取目录

// 对目标所有目录循环打包 并且并行打包
runParallel(targets, build)

function runParallel(targets, interatorFn){
  const res = []
  for(const item of targets){
    const p = interatorFn(item)
    res.push(p)
  }
  return Promise.all(res)
}

async function build(target){
  // -c 表示采用配置文件
  // --environment表示设置环境变量
  await execa('rollup', ['-c', '--environment', `TARGET:${target}`], {
    stdio: 'inherit' // 将子进程打包的信息共享给父进程
  })
}
