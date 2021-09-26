const { parse } = require('es-module-lexer')

const source = `
import { createApp } from 'vue';
import axios from 'axios';
`
parse(source).then(res => {
  const imports = res[0]
  console.log(imports)
})

/* s为七十位置 e为结束位置
[
  { n: 'vue', s: 28, e: 31, ss: 1, se: 32, d: -1, a: -1 },
  { n: 'axios', s: 53, e: 58, ss: 34, se: 59, d: -1, a: -1 }
]
*/
