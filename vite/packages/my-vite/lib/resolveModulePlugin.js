const path = require('path')
const fs = require('fs').promises
const findUp = require('find-up')

const moduleReg = /\/@modules\//
function resolveModulePlugin({ app, root }) {
  app.use(async (ctx, next) => {
    if (!moduleReg.test(ctx.path)) return next()
    const moduleId = ctx.path.replace(moduleReg, '')
    ctx.type = 'js'
    const modulePath = await resolveModule(root, moduleId)
    const content = await fs.readFile(modulePath, 'utf8')
    ctx.body = content
  })
}

async function resolveModule(root, moduleId) {
  let nodeModulePath = await findUp('node_modules', {
    cwd: root,
    type: 'directory'
  })
  // 找到模块package.json的路径
  const pckPath = path.resolve(nodeModulePath, `${moduleId}/package.json`)
  const pckJson = JSON.parse(await fs.readFile(pckPath, 'utf8'))
  const modulePath = pckJson.module
  if (modulePath) {
    const finalFullpath = path.resolve(
      nodeModulePath,
      `${moduleId}/${modulePath}`
    )
    return finalFullpath
  }
  throw new Error(`${pckPath}中文件中没有定义module`)
}

module.exports = resolveModulePlugin
