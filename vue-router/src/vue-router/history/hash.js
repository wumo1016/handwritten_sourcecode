import History from './base'

function ecsureHash() {
  if (!window.location.hash) {
    window.location.hash = '/'
  }
}

function getHash() {
  return window.location.hash.slice(1)
}

export default class Hash extends History {
  constructor(router) {
    super(router)

    // hash 模式需要加一个默认 hash 地址
    ecsureHash()
  }

  getCurrentLocation() {
    return getHash()
  }

  setUpListener() {
    window.addEventListener('hashchange', () => {
      // 切换组件
      this.transitionTo(getHash())
    })
  }

  pushState(path) {
    window.location.hash = path
  }
}
