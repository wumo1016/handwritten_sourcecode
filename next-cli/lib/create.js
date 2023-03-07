const path = require('path')

module.exports = async (projectName) => {
  // 命令运行时的目录
  const cwd = process.cwd()
  // 目录拼接项目名
  const targetDir = path.resolve(cwd, projectName || '.')
  console.log(`创建项目的目录路径: ${targetDir}`)
}
