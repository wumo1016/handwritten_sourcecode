/**
 * @Author: wyb
 * @Descripttion: 格式化路径
 * @param {*} path
 */
function normalizePath(path) {
  //保证所有的路径路径分隔符全部是/,而非\
  return path.replace(/\\/g, '/')
}

const htmlTypesRE = /\.html$/
const scriptModuleRE = /<script\s+type="module"\s+src\="(.+?)">/

const isJSRequest = (url) => /\.(js|vue)($|\?)/.test(url)

module.exports = {
  normalizePath,
  htmlTypesRE,
  scriptModuleRE,
  isJSRequest
}
