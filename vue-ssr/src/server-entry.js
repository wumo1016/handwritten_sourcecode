// 服务端入口
// 服务端渲染可以返回一个函数
import createApp from './app.js'

// url 是服务端在renderToString的时候传入
// 此方法在服务端执行
export default ({url}) => {
  return new Promise((r, j) => {
    let { app, router } = createApp()
    router.push(url)
    router.onReady(() => { // 等待路由跳转完成 组件已经准备好了触发
      const matchComponents = router.getMatchedComponents() // 获取当前路由匹配到的组件 如果没有匹配到 后端返回错误结果
      if(matchComponents.length === 0){
        return j({ code: 404 })
      } else {
        r(app)
      }
    })
  })
}
