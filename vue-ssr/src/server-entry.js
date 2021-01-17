// 服务端入口
// 服务端渲染可以返回一个函数
import createApp from './app.js'

const {
  app
} = createApp()

export default () => {
  let {
    app
  } = createApp()
  return app
}