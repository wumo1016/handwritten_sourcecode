import { reroute } from './reroute'

// popstate事件 只会在浏览器快捷栏点击 前进/后退时 才会触发  或者用户调用 history.back() history.forward() 触发
// pushState/replaceState 是不会触发的
const routingEventsListeningTo = ['hashchange', 'popstate']
const captureEventListeners = {
  hashchange: [],
  popstate: []
}
// 需要将处理应用加载的逻辑卸载最前面 因为用户可能会在应用中绑定自己的监听事件
// 比如vue的路由监听 就需要在应用切换后再执行
const originAddEventListener = window.addEventListener
const originRemoveEventListener = window.removeEventListener

function urlReroute() {
  reroute([], arguments)
}

function excuteListeners() {
  Object.values(captureEventListeners).map(fns => {
    fns.map(fn => fn.apply(this, arguments))
  })
}

window.addEventListener('hashchange', urlReroute)
window.addEventListener('popstate', urlReroute)

// 拦截默认监听事件
window.addEventListener = function (eventName, fn) {
  if (
    routingEventsListeningTo.includes(eventName) &&
    !captureEventListeners[eventName].some(v => v === fn)
  ) {
    captureEventListeners[eventName].push(fn)
    return
  }
  return originAddEventListener.apply(this, arguments)
}
// 拦截默认监听事件
window.removeEventListener = function (eventName, fn) {
  let index
  if (
    routingEventsListeningTo.includes(eventName) &&
    (index = captureEventListeners[eventName].findIndex(v => v === fn)) > -1
  ) {
    captureEventListeners[eventName].splice(index, 1)
    return
  }
  return originRemoveEventListener.apply(this, arguments)
}

window.history.pushState = patchUpdateState(
  window.history.pushState,
  'pushState'
)

window.history.replaceState = patchUpdateState(
  window.history.replaceState,
  'replaceState'
)

function patchUpdateState(updateState, methodName) {
  return function () {
    const beforeUrl = window.location.href
    updateState.apply(this, arguments)
    const afterUrl = window.location.href
    if (beforeUrl !== afterUrl) {
      // 重新加载应用 传入事件源
      urlReroute(new PopStateEvent('popstate'))
    }
  }
}
