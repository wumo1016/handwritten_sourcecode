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
