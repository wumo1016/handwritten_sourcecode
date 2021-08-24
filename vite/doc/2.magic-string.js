const MagicString = require('magic-string')

const source = '1 vue 1'
const magicString = new MagicString(source)

magicString.overwrite(2, 5, '@/modules/vue') // 重写字符串
console.log(magicString.toString())
