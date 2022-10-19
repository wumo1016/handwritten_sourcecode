import { render } from './renderModule.js'
render()

if (import.meta.hot) {
  // 当 main.js 接收到renderModule的改变后，会获取新的renderModule模块内容 然后执行回调
  import.meta.hot.accept(['./renderModule.js'], ([renderModule]) => {
    renderModule.render()
  })
}
