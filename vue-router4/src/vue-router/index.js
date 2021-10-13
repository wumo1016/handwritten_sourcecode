import { shallowRef, computed, reactive } from 'vue'
import { RouterLink } from './router-link'
import { createWebHashHistory } from './history/hash'
import { createWebHistory } from './history/html5'

/**
 * @Author: wyb
 * @Descripttion: 格式化单个路由信息
 * @param {*} route
 */
function normalizeRouteRecord(route) {
  return {
    name: route.name,
    path: route.path,
    meta: route.meta || {},
    beforeEnter: route.beforeEnter,
    children: route.children || [],
    components: {
      default: route.component
    }
  }
}

function createRouteRecordMatcher(record, parent) {
  const matcher = {
    path: record.path,
    record: record,
    parent,
    children: []
  }
  if (parent) {
    parent.children.push(matcher)
    matcher.path = parent.path + matcher.path
  }
  return matcher
}

function createRouterMatcher(routes) {
  const matchers = []

  function addRoute(route, parent) {
    const normalizeRecord = normalizeRouteRecord(route)

    const matcher = createRouteRecordMatcher(normalizeRecord, parent)
    matchers.push(matcher)

    normalizeRecord.children.forEach(c => addRoute(c, matcher))
  }

  routes.forEach(route => addRoute(route, null))

  function resolve(location) {
    const matched = []

    let mactcher = matchers.find(m => m.path === location.path)
    while (mactcher) {
      matched.unshift(mactcher.record) // 将用户的原始数据 放到matched中
      mactcher = mactcher.parent
    }

    return {
      path: location.path,
      matched
    }
  }

  return {
    addRoute,
    matchers,
    resolve
  }
}

// 初始化路由系统中的默认参数
const START_LOACTION_NORMALIZE = {
  path: '/',
  // params: {},
  // query: {},
  matched: [] // 当前路径匹配到的记录
}

function createRouter(options) {
  // 使用的路由模式
  const routerHistory = options.history
  // 格式化路由 拍平
  const matcher = createRouterMatcher(options.routes)

  const currentRoute = shallowRef(START_LOACTION_NORMALIZE)

  function resolve(to) {
    if (typeof to === 'string') {
      to = { path: to }
    }
    return matcher.resolve(to)
  }

  function finalizeNavigation(to, from) {
    if (from === START_LOACTION_NORMALIZE) {
      routerHistory.replace(to.path)
    } else {
      routerHistory.push(to.path)
    }
    currentRoute.value = to // 更新最新的路径
  }

  function pushWithRedirect(to) {
    // 根据路径匹配到对于的记录 更新currentRoute
    const targetLocation = resolve(to)
    const from = currentRoute.value
    // 在跳转前做路由的拦截
    // 如果是第一次就直接replace 后面的就是push
    finalizeNavigation(targetLocation, from)
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

      app.provide('router', reactiveRoute)
      app.provide('routeLocation', reactive(reactiveRoute))

      app.component('router-link', RouterLink)
      app.component('router-view', {
        setup(props, { slots }) {
          return () => <div></div>
        }
      })

      if (currentRoute.value === START_LOACTION_NORMALIZE) {
        // 默认初始化
        push(routerHistory.location)
      }
    },
    push() {},
    replace() {}
  }

  return router
}

export { createRouter, createWebHashHistory, createWebHistory }
