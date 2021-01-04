const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配 {{ aaa }}

// 生成属性
function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i]
    if (attr.name === 'style') {
      let styleObj = {}
      attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
        styleObj[arguments[1]] = arguments[2]
      })
      attr.value = styleObj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}

function genChildren(ast) {
  let children = ast.children
  if (children) {
    return children.map(child => gen(child)).join(',')
  }
  return false
}

function gen(el) {
  if (el.type === 1) {
    return generate(el)
  } else {
    const text = el.text
    if (!defaultTagRE.test(text)) {
      return `_v('${text}')`
    }
    // 需要将 defaultTagRE.lastIndex 置为0 因为前面使用过 test 所以 lastIndex已经改变，所有后面可能匹配不到
    // 'hello{{name}}world' => ["{{name}}", "name", index: 5, input: "hello{{name}}world", groups: undefined]
    const tokens = []
    let lastIndex = defaultTagRE.lastIndex = 0,
      match = ''
    while (match = defaultTagRE.exec(text)) {
      const index = match.index
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
      }
      tokens.push(`_s(${match[1].trim()})`) // _s JSON.stringfy 处理变量
      lastIndex = index + match[0].length
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    return `_v(${tokens.join("+")})` // _v 创建文本
  }
}
// return _c('div',{id:'app',test:'wyb'},'hello' )
export function generate(ast) {
  log(ast)
  let children = genChildren(ast)
  let code = `_c('${ast.tag}',${
    ast.attrs.length ? genProps(ast.attrs) : 'undefined'
  }${children ? `,${children}` : ''})`
  log(code)
  return code
}