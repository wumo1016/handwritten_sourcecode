const fs = require('fs-extra')
const { isJSRequest } = require('../../utils')

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} server
 */
function transformMiddleware(server) {
  return async function (req, res, next) {
    if (req.method !== 'GET') return next()
    if (isJSRequest(req.url)) {
      const result = await transformRequest(req.url, server)
      if (result) {
        return send(req, res, result.code, 'js')
      } else {
        return next()
      }
    } else {
      return next()
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} url
 * @param {*} server
 */
async function transformRequest(url, server) {
  const { pluginContainer } = server
  /* resolveId */
  const resolved = await pluginContainer.resolveId(url)
  if (!resolved) return
  const id = resolved.id
  /* load */
  const loadResult = await pluginContainer.load(id)
  let code
  if (loadResult) {
    code = loadResult.code
  } else {
    let fsPath = id.split('?')[0] // 去掉 query
    code = await fs.readFile(fsPath, 'utf-8')
  }
  /* transform */
  const res = await pluginContainer.transform(code, id)
  return res
}

// Content-Type 映射
const alias = {
  js: 'application/javascript',
  css: 'text/css',
  html: 'text/html',
  json: 'application/json'
}
function send(req, res, content, type) {
  res.setHeader('Content-Type', alias[type])
  res.statusCode = 200
  return res.end(content)
}

module.exports = transformMiddleware
