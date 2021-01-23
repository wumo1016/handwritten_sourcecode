export let Vue
import RouterLink from './components/link'
import RouterView from './components/view'

export default function install(_Vue) {
  Vue = _Vue

  // 为了在每个组件中都能拿到 _router
  // 所有组件通过 this._routerRoot._router 拿到用户传入的路由
  Vue.mixin({
    beforeCreate() {
      const router = this.$options.router
      if (router) {
        this._router = router
        this._routerRoot = this

        // 初始化逻辑
        this._router.init(this)
      } else {
        this._routerRoot = this.$parent && this.$parent._routerRoot
      }
    }
  })

  // 扩展原型方法 $router $route
  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot._router
    }
  })

  Object.defineProperty(Vue.prototype, '$route', {})

  // 扩展全局组件 router-link router-view
  Vue.component('router-link', RouterLink)
  Vue.component('router-view', RouterView)
}
