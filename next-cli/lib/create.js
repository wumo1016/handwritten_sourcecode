const path = require('path')
const Creator = require('./Creator')

module.exports = async (projectName) => {
  // 命令运行时的目录
  const cwd = process.cwd()
  // 目录拼接项目名
  const targetDir = path.resolve(cwd, projectName || '.')
  // 实例化
  const creator = new Creator(projectName, targetDir)
  // 调用
  await creator.create()
}
