import { reroute } from './navigations/reroute'

export let started = false
/**
 * @Descripttion: 挂载应用
 * @param {*}
 */
export function start() {
  started = true
  // 加载并挂载应用
  reroute()
}
