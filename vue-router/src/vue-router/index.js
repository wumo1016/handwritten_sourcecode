import createMatcher from './create-matcher'
import install from './install'
import Hash from './history/hash'
import HTML5History from './history/h5'

class VueRouter {
  constructor(options) {
    this.mode = options.mode || 'hash'
    this.routes = options.routes

    this.matcher = createMatcher(options.routes || [])

    // 根据模式初始化不同的路由系统
    switch (this.mode) {
      case 'hash':
        this.history = new Hash(this)
        break
      case 'history':
        this.history = new HTML5History(this)
        break
      default:
        break
    }
  }

  match(path) {
    return this.matcher.match(path)
  }

  init(app) {
    // const router = app._routerRoot._router
    const history = this.history

    // 初始化完成后 应该先进行一次跳转
    const setUpListener = () => {
      history.setUpListener()
    }

    // 第一跳转添加监听函数
    history.transitionTo(history.getCurrentLocation(), setUpListener)

    history.listen(route => {
      // 监听 current 变化 重新给 _route 赋值
      app._route = route
    })
  }

  push(path) {
    this.history.transitionTo(path, () => {
      window.location.hash = path
    })
  }
}

VueRouter.install = install

export default VueRouter
