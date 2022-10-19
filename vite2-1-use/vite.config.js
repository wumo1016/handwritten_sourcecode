// const vue = require('@vitejs/plugin-vue')
const vue = require('./plugins/plugin-vue')
module.exports = {
  plugins: [vue()]
}

// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// export default defineConfig({
//   plugins: [vue()]
// })

/* 
import { createHotContext as __vite__createHotContext } from '/@vite/client'
import.meta.hot = __vite__createHotContext('/src/main.js')
import { render } from '/src/renderModule.js?t=1666048567778'
render()

if (import.meta.hot) {
  // 当 main.js 接收到renderModule的改变后，会获取新的renderModule模块内容 然后执行回调
  import.meta.hot.accept(['/src/renderModule.js'], ([renderModule]) => {
    renderModule.render()
  })
}

*/

/* websocket 更新消息
{
  "type": "update",
  "updates": [
    {
      "type": "js-update",
      "path": "/src/main.js",
      "acceptedPath": "/src/renderModule.js"
    }
  ]
}
当一个模块发生变化的时候，会向上通知，如果有一个模块能够接收自己的改变，那么就到此为止
让此接收的模块执行回调，处理更新
如果一直向上通知，没有任何一个模块能接收，直接 刷新浏览器
*/
