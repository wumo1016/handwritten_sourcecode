const fs = require('fs-extra')
const {
  parse,
  compileScript, // 编译脚本
  rewriteDefault,
  compileTemplate, // 编译模板
  compileStyleAsync // 编译样式
} = require('vue/compiler-sfc')
const descriptorCache = new Map()
/**
 * @Author: wyb
 * @Descripttion:
 */
function vue() {
  return {
    name: 'vue',
    async transform(source, id) {
      if (id.endsWith('.vue')) {
        const { filename, query } = parseVueRequest(id) // E:/wumo/handwritten_sourcecode/vite2-1-use/src/app.vue
        if (filename.endsWith('.vue')) {
          return await transformMain(source, filename)
        }
      }
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion: 解析请求路径
 * @param {*} id
 */
function parseVueRequest(id) {
  // App.vue?id=1  filename=App.vue query={id:1}
  const [filename, querystring = ''] = id.split('?')
  const query = new URLSearchParams(querystring) // qs
  return {
    filename,
    query
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} source
 * @param {*} filename
 */
async function transformMain(source, filename) {
  // 获取.vue文件解析结果
  const descriptor = await getDescriptor(filename)
  // 获取脚本代码
  const scriptCode = genScriptCode(descriptor, filename)
  // 获取模板代码
  const templateCode = genTemplateCode(descriptor, filename)
  // 构建返回的代码
  const code = [
    scriptCode,
    templateCode,
    '_sfc_main.render = render;',
    'export default _sfc_main;'
  ].join('\n')
  return { code }
}
/**
 * @Author: wyb
 * @Descripttion: 获取.vue文件解析结果
 * @param {*} filename
 */
async function getDescriptor(filename) {
  // 缓存解析结果
  let descriptor = descriptorCache.get(filename)
  if (descriptor) return descriptor
  // 读取.vue文件的内容
  const content = await fs.readFile(filename, 'utf8')
  const result = parse(content, { filename })
  descriptor = result.descriptor
  descriptorCache.set(filename, descriptor)
  return descriptor
}
/**
 * @Author: wyb
 * @Descripttion: 根据vue文件解析结果生成脚本代码
 * @param {*} descriptor
 * @param {*} id
 */
function genScriptCode(descriptor, id) {
  const script = compileScript(descriptor, { id })
  return rewriteDefault(script.content, '_sfc_main')
}
/**
 * @Author: wyb
 * @Descripttion: 根据vue文件解析结果生成脚本代码
 * @param {*} descriptor
 * @param {*} id
 */
function genTemplateCode(descriptor, id) {
  const result = compileTemplate({ source: descriptor.template.content, id })
  return result.code
}

module.exports = vue

/* app.vue解析结果
{
  descriptor: {
    filename: 'E:/wumo/handwritten_sourcecode/vite2-1-use/src/app.vue',
    source: '<template>\r\n' +
      '  <h1>App</h1>\r\n' +
      '</template>\r\n' +
      '<script>\r\n' +
      'export default {\r\n' +
      "  name: 'App'\r\n" +
      '}\r\n' +
      '</script>\r\n' +
      '<style>\r\n' +
      'h1 {\r\n' +
      '  color: red;\r\n' +
      '}\r\n' +
      '</style>\r\n',
    template: {
      type: 'template',
      content: '\r\n  <h1>App</h1>\r\n',
      loc: [Object],
      attrs: {},
      ast: [Object],
      map: [Object]
    },
    script: {
      type: 'script',
      content: "\r\nexport default {\r\n  name: 'App'\r\n}\r\n",
      loc: [Object],
      attrs: {},
      map: [Object]
    },
    scriptSetup: null,
    styles: [ [Object] ],
    customBlocks: [],
    cssVars: [],
    slotted: false,
    shouldForceReload: [Function: shouldForceReload]
  },
  errors: []
}
*/
