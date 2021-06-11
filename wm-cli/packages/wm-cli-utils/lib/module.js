const Module = require('module')
const path = require('path')

exports.loadModule = function (url, targetDir) {
  // 创建一个require方法
  return Module.createRequire(path.resolve(targetDir, 'package.json'))(url)
}