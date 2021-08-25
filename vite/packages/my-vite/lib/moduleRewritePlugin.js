const koaStatic = require('koa-static')
const path = require('path')
const { Readable } = require('stream')
const { parse } = require('es-module-lexer')
const MagicString = require('magic-string')

function moduleRewritePlugin({ app, root }) {
  app.use(async (ctx, next) => {
    await next()
    if (ctx.body && ctx.response.is('js')) {
      const originContent = await readBody(ctx.body)
      const res = await rewriteImports(originContent)
      ctx.body = res
    }
  })
}

async function readBody(body) {
  if (body instanceof Readable) {
    return new Promise(r => {
      let buffers = []
      body
        .on('data', chunk => {
          buffers.push(chunk)
        })
        .on('end', () => {
          r(Buffer.concat(buffers).toString())
        })
    })
  }
  return body.toString()
}

async function rewriteImports(source) {
  const [imports] = await parse(source)
  if (imports.length > 0) {
    const magicString = new MagicString(source)
    for (let i = 0; i < imports.length; i++) {
      const { n, s, e } = imports[i]
      // 如果不是以.或/开头
      if (/^[^\/\.]/.test(n)) {
        magicString.overwrite(s, e, `/@modules/${n}`)
      }
    }
    return magicString.toString()
  }
  return source
}

module.exports = moduleRewritePlugin
