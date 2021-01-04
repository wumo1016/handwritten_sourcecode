import { generate } from "./generate"
import { parserHTML } from "./parser"

// html => ast => render => vdom => 真实dom
export function compileToFunction(template) {

  const ast = parserHTML(template)
  const code = generate(ast)
  const render = new Function(`with(this){ return ${code} }`) // 将生成得字符串转化成函数执行
  return render
}

/* 
ast 是语法层面的描述 可以描述 html css js
vdom 专门描述dom节点的
*/
