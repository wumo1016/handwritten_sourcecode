import { shallowRef, computed, reactive } from 'vue'
import { RouterLink } from './router-link'
import { RouterView } from './router-view'
import { createWebHashHistory } from './history/hash'
import { createWebHistory } from './history/html5'

import { createRouterMatcher } from './macther'

// 初始化路由系统中的默认参数
const START_LOACTION_NORMALIZE = {
  path: '/',
  // params: {},
  // query: {},
  matched: [] // 当前路径匹配到的记录
}

function useCallback() {
  const handlers = []

  function add(handler) {
    handlers.push(handler)
  }

  return {
    add,
    list: () => handlers
  }
}

function createRouter(options) {
  // 使用的路由模式
  const routerHistory = options.history
  // 格式化路由 拍平
  const matcher = createRouterMatcher(options.routes)

  const currentRoute = shallowRef(START_LOACTION_NORMALIZE)

  // 路由导航相关
  const beforeEachGuards = useCallback()
  const beforeResolveGuards = useCallback()
  const afterEachGuards = useCallback()

  function resolve(to) {
    if (typeof to === 'string') {
      to = { path: to }
    }
    return matcher.resolve(to)
  }

  let ready // 用来标记是否是第一次渲染
  function markAsReady() {
    if (ready) return
    ready = true

    routerHistory.listen((to, from) => {
      pushWithRedirect(to, true)
    })
  }

  function finalizeNavigation(to, from, replaceed) {
    if (from === START_LOACTION_NORMALIZE || replaceed) {
      routerHistory.replace(to.path)
    } else {
      routerHistory.push(to.path)
    }
    currentRoute.value = to // 更新最新的路径

    // console.log(currentRoute.value);

    // 如果是初始化 还需要注册一个listen区更新currentRoute
    markAsReady()
  }

  function extractChangeRecords(to, from) {
    const leaveingRecords = []
    const updateingRecords = []
    const enteringRecords = []

    const len = Math.max(to.matched.length, from.matched.length)
    for (let i = 0; i < len; i++) {
      const recordFrom = from.matched[i]
      if (recordFrom) {
        // 如果去的和来的都有 就是更新
        if (to.matched.find(v => v.path === recordFrom.path)) {
          updateingRecords.push(recordFrom)
        } else {
          // 来的有 去的没有就是离开
          leaveingRecords.push(recordFrom)
        }
      }
      const recordTo = to.matched[i]
      if (recordTo) {
        // 去的有 来的没有 就是进入
        if (!from.matched.find(v => v.path === recordTo.path)) {
          enteringRecords.push(recordTo)
        }
      }
    }
    return [leaveingRecords, updateingRecords, enteringRecords]
  }

  function guardToPromise(guard, to, from, record) {
    return () =>
      new Promise((r, j) => {
        const guardReturn = guard.call(record, to, from, r)
        // 这里如果不调用next 将会自动调用next
        return Promise.resolve(guardReturn).then(() => r())
      })
  }

  function extractComponentGuards(macthed, guardType, to, from) {
    const guards = []
    for (const record of macthed) {
      const rawComponent = record.components.default
      const guard = rawComponent[guardType]
      guard && guards.push(guardToPromise(guard, to, from, record))
    }
    return guards
  }
  // promise组合函数
  function runGuardsQueue(guards) {
    return guards.reduce(
      (promise, guard) => promise.then(() => guard()),
      Promise.resolve()
    )
  }

  async function navigate(to, from) {
    // 需要知道哪个组件是离开的 哪个组件是进入的 哪个组件是更新的
    const [
      leaveingRecords,
      updateingRecords,
      enteringRecords
    ] = extractChangeRecords(to, from)
    // 需要倒序执行 因为是先卸载子组件
    // 执行组件 beforeRouteLeave 钩子
    let guards = extractComponentGuards(
      leaveingRecords.reverse(),
      'beforeRouteLeave',
      to,
      from
    )
    return runGuardsQueue(guards)
      .then(() => {
        // 执行 beforeEach
        guards = []
        for (const guard of beforeEachGuards.list()) {
          guards.push(guardToPromise(guard, to, from, guard))
        }
        return runGuardsQueue(guards)
      })
      .then(() => {
        // 执行 beforeRouteUpdate
        guards = extractComponentGuards(
          updateingRecords,
          'beforeRouteUpdate',
          to,
          from
        )
        return runGuardsQueue(guards)
      })
      .then(() => {
        // 执行 beforeEnter
        guards = []
        for (const record of to.matched) {
          if (record.beforeEnter) {
            guards.push(guardToPromise(record.beforeEnter, to, from, record))
          }
        }
        return runGuardsQueue(guards)
      })
      .then(() => {
        // 执行 beforeRouteEnter
        guards = extractComponentGuards(
          enteringRecords,
          'beforeRouteEnter',
          to,
          from
        )
        return runGuardsQueue(guards)
      })
      .then(() => {
        // 执行 beforeResolve
        guards = []
        for (const guard of beforeResolveGuards.list()) {
          guards.push(guardToPromise(guard, to, from, guard))
        }
        return runGuardsQueue(guards)
      })
  }

  function pushWithRedirect(to, replaceed) {
    // 根据路径匹配到对于的记录 更新currentRoute
    const targetLocation = resolve(to)
    const from = currentRoute.value
    // 在跳转前做路由的拦截
    navigate(targetLocation, from)
      .then(() => {
        return finalizeNavigation(targetLocation, from, replaceed)
      })
      .then(() => {
        // 路由跳转完守卫
        for (const guard of afterEachGuards.list()) {
          guard(to, from)
        }
      })
  }

  function push(to) {
    return pushWithRedirect(to)
  }

  const router = {
    install(app) {
      const router = this
      app.config.globalProperties.$router = router
      Object.defineProperty(app.config.globalProperties, '$route', {
        enumerable: true,
        get() {
          return currentRoute.value
        }
      })

      const reactiveRoute = {}
      for (const key in START_LOACTION_NORMALIZE) {
        reactiveRoute[key] = computed(() => currentRoute.value[key])
      }

      app.provide('router', router)
      app.provide('routeLocation', reactive(reactiveRoute))

      app.component('router-link', RouterLink)
      app.component('router-view', RouterView)

      if (currentRoute.value === START_LOACTION_NORMALIZE) {
        // 默认初始化
        push(routerHistory.location)
      }
    },
    push,
    replace() {},
    brforeEach: beforeEachGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterEachGuards.add
  }

  return router
}

export { createRouter, createWebHashHistory, createWebHistory }
