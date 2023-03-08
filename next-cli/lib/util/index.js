const fs = require('fs-extra')
const path = require('path')

function writeFileTree(dir, files) {
  Object.keys(files).forEach((name) => {
    const filePath = path.join(dir, name)
    // 确保目标目录存在, 如果不存在就创建
    fs.ensureDirSync(path.dirname(filePath))
    // 创建文件, 并写入内容
    fs.writeFileSync(filePath, files[name])
  })
}

module.exports = {
  writeFileTree
}
