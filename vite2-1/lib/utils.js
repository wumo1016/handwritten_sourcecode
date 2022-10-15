/**
 * @Author: wyb
 * @Descripttion: 格式化路径
 * @param {*} path
 */
function normalizePath(path) {
  //保证所有的路径路径分隔符全部是/,而非\
  return path.replace(/\\/g, '/')
}

module.exports = {
  normalizePath
}
