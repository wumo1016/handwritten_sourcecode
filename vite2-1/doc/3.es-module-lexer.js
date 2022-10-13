const { init, parse } = require('es-module-lexer')

;(async function () {
  const sourceCode = `import _ from 'lodash';\nexport var age = 15;`
  // debugger
  await init
  const [imports, exports] = parse(sourceCode)
  console.log(imports) // [ { n: 'lodash', s: 15, e: 21, ss: 0, se: 22, d: -1, a: -1 } ]
  console.log(exports) // [ { s: 35, e: 38, ls: 35, le: 38, n: 'age', ln: 'age' } ]
})()
