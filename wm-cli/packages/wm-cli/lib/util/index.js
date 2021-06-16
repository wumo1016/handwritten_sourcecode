const fs = require('fs-extra')
const path = require('path')

exports.writeFileTree = async (targetDir, files) => {
  Object.keys(files).forEach(name => {
    let filePath = path.join(targetDir, name)
    // 先查看文件所在目录是否存在 如果不存在就创建 
    fs.ensureDirSync(path.dirname(filePath))
    // 写入文件
    fs.writeFileSync(filePath, files[name])
  })
}