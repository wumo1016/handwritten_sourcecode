import { reroute } from '../navigations/reroute'
import {
  BOOTSTRAPPING,
  LOADING_SOURCE_CODE,
  MOUNTED,
  NOT_BOOTSTRAPPED,
  NOT_LOADED,
  NOT_MOUNTED,
  shouldBeActive
} from './app-helpers'

const apps = []

/**
 * @Descripttion: 注册应用
 * @param {*} appName 应用名
 * @param {*} loadApp 加载应用的方法
 * @param {*} activeWhen 何时调用 loadApp 方法
 * @param {*} customProps 自定义属性
 */
export function registerApplication(appName, loadApp, activeWhen, customProps) {
  apps.push({
    name: appName,
    loadApp,
    activeWhen,
    customProps,
    status: NOT_LOADED
  })

  reroute() // 加载应用

  // console.log(apps)
}

/**
 * @Descripttion:
 * @param {*}
 */
export function getAppChanges() {
  const appsToUnmount = [] // 需要卸载的app
  const appsToLoad = [] // 需要加载的app
  const appsToMount = [] // 需要挂载的app

  apps.forEach(app => {
    const appShouldBeActive = shouldBeActive() // 是否需要挂载
    switch (app.status) {
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if (appShouldBeActive) appsToLoad.push(app)
        break
      case NOT_BOOTSTRAPPED:
      case BOOTSTRAPPING:
      case NOT_MOUNTED:
        if (appShouldBeActive) appsToLoad.push(app)
        break
      case MOUNTED:
        break
      default:
        break
    }
  })
}
