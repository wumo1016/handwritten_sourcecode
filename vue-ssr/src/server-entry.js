// 服务端入口
// 服务端渲染可以返回一个函数
import createApp from './app.js'

// url 是服务端在renderToString的时候传入
// 此方法在服务端执行
export default (context) => {
  const { url } = context
  return new Promise((r, j) => {
    let { app, router, store } = createApp()
    router.push(url)
    router.onReady(() => { // 等待路由跳转完成 组件已经准备好了触发
      const matchComponents = router.getMatchedComponents() // 获取当前路由匹配到的组件 如果没有匹配到 后端返回错误结果
      
      if(matchComponents.length === 0){
        return j({ code: 404 })
      } else {
        Promise.all(matchComponents.map(component => {
          if(component.asyncData){
            return component.asyncData(store)
          }
        })).then(res => {
          context.state = store.state // 固定写法 会默认 window.__INITIAL_STATE__ = { name: 'test' }
          // app是一个实例 有$options.render 但并未执行
          r(app)
        })
      }
    })
  })
}
