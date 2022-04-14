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

  if (started) {
    // 调用start
    return performAppChanges()
  } else {
    // 调用register
    // 注册应用时 需要预先加载
    return loadApps()
  }
}

/**
 * @Descripttion: 根据路径来装载
 * @param {*}
 */
async function performAppChanges() {}

/**
 * @Descripttion: 预加载应用
 * @param {*}
 */
async function loadApps() {}
