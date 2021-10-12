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

  return {
    addRoute,
    matchers
  }
}

function createRouter(options) {
  // 使用的路由模式
  const routerHistory = options.routerHistory
  // 格式化路由 拍平
  const matcher = createRouterMatcher(options.routes)

  const router = {
    install(app) {
      app.component('router-link', {
        setup(props, { slots }) {
          return () => <a>{slots.default && slots.default()}</a>
        }
      })
      app.component('router-view', {
        setup(props, { slots }) {
          return () => <div></div>
        }
      })

      console.log(matcher);
    }
  }

  return router
}

export { createRouter, createWebHashHistory, createWebHistory }
