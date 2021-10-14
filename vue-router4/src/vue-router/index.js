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

  function pushWithRedirect(to, replaceed) {
    // 根据路径匹配到对于的记录 更新currentRoute
    const targetLocation = resolve(to)
    const from = currentRoute.value
    // 在跳转前做路由的拦截
    // 如果是第一次就直接replace 后面的就是push
    finalizeNavigation(targetLocation, from, replaceed)
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
    replace() {}
  }

  return router
}

export { createRouter, createWebHashHistory, createWebHistory }
