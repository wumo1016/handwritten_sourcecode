import History from './base'

export default class HTML5History extends History {
  constructor(router) {
    super(router)
  }

  getCurrentLocation() {
    return window.location.pathname
  }

  setUpListener() {
    window.addEventListener('popstate', () => {
      this.transitionTo(window.location.pathname)
    })
  }

  pushState(path) {
    history.pushState({}, null, path)
  }
}
