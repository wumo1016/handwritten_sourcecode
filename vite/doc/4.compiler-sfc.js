const { parse, compileTemplate } = require('@vue/compiler-sfc')
const source = `
<template>
  <div>app</div>
</template>

<script>
export default {
  name: 'App'
}
</script>
`

const { descriptor } = parse(source)
console.log(descriptor)
const res = compileTemplate({
  source: descriptor.template.content
})
console.log(res.code)
