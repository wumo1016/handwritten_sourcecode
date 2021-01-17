import Vue from 'vue'
import App from './app.vue'

// 入口改装成函数 目的是服务端渲染时 每次访问的实例都通过这个工厂函数生成一个新的实例
export default () => {
  const app = new Vue({
    render: h => h(App)
  })
  return {
    app
  }
}