import { getAppChanges } from '../applications/app'
import { toBootstarpPromise } from '../leftcycles/bootstrap'
import { toLoadPromise } from '../leftcycles/load'
import { toMountPromise } from '../leftcycles/mount'
import { toUnmountPromise } from '../leftcycles/unmount'
import { started } from '../start'

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*}
 */
export function reroute() {
  // 获取需要加载的应用
  // 获取需要被挂载的应用
  // 获取需要卸载的应用

  const { appsToUnmount, appsToLoad, appsToMount } = getAppChanges()

  if (started) {
    // 调用start
    return performAppChanges(appsToUnmount, appsToLoad, appsToMount)
  } else {
    // 调用register
    // 注册应用时 需要预先加载
    return loadApps(appsToLoad)
  }
}

/**
 * @Descripttion: 根据路径来装载
 * @param {*}
 */
async function performAppChanges(appsToUnmount, appsToLoad, appsToMount) {
  // 先卸载不需要的应用
  const unmountPromises = appsToUnmount.map(toUnmountPromise)
  // 装载需要的应用 加载 => 启动 => 挂载
  appsToLoad.map(async app => {
    app = await toLoadPromise(app)
    app = await toBootstarpPromise(app)
    return await toMountPromise(app)
  })
  appsToMount.map(async app => {
    app = await toBootstarpPromise(app)
    return await toMountPromise(app)
  })
}

/**
 * @Descripttion: 预加载应用
 * @param {*}
 */
async function loadApps(appsToLoad) {
  const apps = await Promise.all(appsToLoad.map(toLoadPromise)) // 获取到 bootstrap mount unmount 方法 放到app上
}
