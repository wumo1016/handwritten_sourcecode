import { generate } from "./generate"
import { parserHTML } from "./parser"

// html => ast => render => vdom => 真实dom
export function compileToFunction(template) {

  const ast = parserHTML(template)
  const code = generate(ast)
  // log(code)

}

/* 
ast 是语法层面的描述 可以描述 html css js
vdom 专门描述dom节点的
*/
