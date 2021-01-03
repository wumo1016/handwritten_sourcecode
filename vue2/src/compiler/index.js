// 下面的 \\ 原因是 字符串也需要转义，到正则中就成了一个了 \
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // 匹配标签名 
const qnameCapture = `((?:${ncname}\\:)?${ncname})` // 获取标签名，match后的第一项
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配开始标签头部
const startTagClose = /^\s*(\/?)>/ // 匹配开始标签尾部
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配闭合标签
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性 a=b a="b" a='b'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配 {{ aaa }}

function parserHTML(html) {

  // root 是根元素 stack 是元素栈
  let root = null,
    stack = [];

  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      advance(start[0].length)
      let end, attr;
      // 如果没有匹配到开始标签尾部，就一直匹配属性
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        })
        advance(attr[0].length) // 每匹配一个属性对删掉一个，知道匹配到开始标签的尾部
      }
      if (end) {
        advance(end[0].length)
      }
      return match
    }
    return false
  }

  function start(tagName, attrs) { // 开始标签相关
    const element = createAstElement(tagName, attrs)
    if (!root) {
      root = element
    }
    if (stack.length) {
      // 记录父子关系
      const parent = stack[stack.length - 1]
      element.parent = parent
      parent.children.push(element)
    }
    stack.push(element)
  }

  function chars(text) { // 开始标签和结束标签之间的内容
    text = text.replace(/\s/g, '')
    const parent = stack[stack.length - 1]
    if (text) {
      parent.children.push({
        type: 3,
        text
      })
    }
  }

  function end(tagName) { // 结束标签相关
    const last = stack.pop()
    if (last.tag !== tagName) {
      throw new Error('标签不匹配')
    }
  }

  function createAstElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1,
      children: [],
      parent: null,
      attrs
    }
  }

  function advance(length) { // 截取html，将已经匹配到的截取掉
    html = html.substring(length)
  }

  while (html) {
    let textEnd = html.indexOf('<') // 要么是开始标签 要么是闭合标签
    if (textEnd === 0) { // 解析开始标签及属性
      const startTatMatch = parseStartTag()
      if (startTatMatch) {
        start(startTatMatch.tagName, startTatMatch.attrs)
        continue
      }
      const endTagMatch = html.match(endTag)
      if (endTagMatch) { // 解析闭合标签
        end(endTagMatch[1])
        advance(endTagMatch[0].length)
        continue
      }
    }
    let text
    if (textEnd > 0) { // 说明是结束标签
      text = html.substring(0, textEnd) // 结束标签前面的内容取出
    }
    if (text) {
      chars(text)
      advance(text.length)
      continue
    }
  }
  log(root)

}

export function compileToFunction(template) {

  parserHTML(template)

}