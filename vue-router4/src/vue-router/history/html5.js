/**
 * @Author: wyb
 * @Descripttion: 获取当前路径
 * @param {*}
 */
function createCurrentLocation(base) {
  const { pathname, search, hash } = window.location
  const isHash = base.startsWith('#')
  if (isHash) {
    return base.slice(1) || '/'
  }
  return pathname + search + hash
}
/**
 * @Author: wyb
 * @Descripttion: 创建自己的页面状态
 * @param {*} back 后退路径
 * @param {*} current 当前路径
 * @param {*} forward 前进路径
 * @param {*} replace 是否是替换路径
 * @param {*} computedScroll 是否记录滚动条
 */
function buildState(
  back,
  current,
  forward,
  replace = false,
  computedScroll = false
) {
  return {
    back,
    current,
    forward,
    replace,
    scroll: computedScroll
      ? { left: window.pageXOffset, top: window.pageYOffset }
      : null,
    position: window.history.length - 1
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*}
 */
function useHistoryStateNavigation(base) {
  const currentLocation = {
    value: createCurrentLocation(base)
  }
  const historyState = {
    value: window.history.state
  }
  // 第一次刷新页面的时候没有状态 维护一个自己的状态
  if (!historyState.value) {
    changeLocation(
      currentLocation.value,
      buildState(null, currentLocation.value, null, true),
      true
    )
  }
  // 同步状态进 history.state
  function changeLocation(to, state, replace) {
    const isHash = base.startsWith('#')
    const url = isHash ? base + to : to
    window.history[replace ? 'replaceState' : 'pushState'](state, null, url)
    historyState.value = state
  }

  function push(to, data) {
    //  维护一个跳转前状态 当前+去哪
    const currentState = Object.assign({}, historyState.value, {
      forward: to,
      scroll: { left: window.pageXOffset, top: window.pageYOffset }
    })
    // 本质没有跳转 只是更新了状态 后续在vue中可以监控状态的变化
    changeLocation(currentState.current, currentState, true)
    const state = Object.assign(
      {},
      buildState(currentLocation.value, to, null),
      {
        position: currentState.position + 1
      },
      data
    )
    changeLocation(to, state, false)
    currentLocation.value = to
  }

  function replace(to, data) {
    const state = Object.assign(
      {},
      buildState(historyState.value.back, to, historyState.value.forward, true),
      data
    )
    changeLocation(to, state, true)
    currentLocation.value = to
  }

  return {
    location: currentLocation,
    state: historyState,
    push,
    replace
  }
}
// 前进后退的时候要更新 currentLocation historyState
function useHistoryListeners(base, historyState, currentLocation) {
  let listeners = []
  const popStateHandler = ({ state }) => {
    const from = currentLocation.value // 从哪来
    const to = createCurrentLocation(base) // 去哪
    const fromState = historyState.value

    currentLocation.value = to
    historyState.value = state

    const isBack = state.position < fromState.position

    listeners.forEach(cb => cb(to, from, { isBack }))
  }
  // 只能监听浏览器的前进后退
  window.addEventListener('popstate', popStateHandler)

  function listen(cb) {
    listeners.push(cb)
  }

  return {
    listen
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*}
 */
export function createWebHistory(base = '') {
  const historyNavigation = useHistoryStateNavigation(base)

  const historyListeners = useHistoryListeners(
    base,
    historyNavigation.state,
    historyNavigation.location
  )

  const routerHistory = Object.assign({}, historyNavigation, historyListeners)

  Object.defineProperty(routerHistory, 'location', {
    get() {
      return historyNavigation.location.value
    }
  })

  Object.defineProperty(routerHistory, 'state', {
    get() {
      return historyNavigation.state.value
    }
  })

  return routerHistory
}

const routerHistory = createWebHistory()

routerHistory.listen((to, from) => {
  console.log(to, from)
})
