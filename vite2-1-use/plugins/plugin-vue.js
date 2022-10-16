/**
 * @Author: wyb
 * @Descripttion:
 */
function vue() {
  return {
    name: 'vue',
    async transform(source, id) {
      if (id.endsWith('.vue')) {
        return `
          const _sfc_main = {
            name: 'App'
          }
          import {
            openBlock as _openBlock,
            createElementBlock as _createElementBlock
          } from '/node_modules/.vite2_1/deps/vue.js'
          
          function _sfc_render(_ctx, _cache) {
            return _openBlock(), _createElementBlock('h1', null, 'App')
          }
          _sfc_main.render = _sfc_render
          export default _sfc_main
        `
      }
    }
  }
}

module.exports = vue
