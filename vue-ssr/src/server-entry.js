// 服务端入口
// 服务端渲染可以返回一个函数
import createApp from './app.js'

export default () => {
  let {
    app,
    router
  } = createApp()
  router.push('/') // 表示永远跳转 / 路径
  return app
}