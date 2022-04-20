import {
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED
} from '../applications/app-helpers'

/**
 * @Author: wyb
 * @Descripttion: 加载应用
 * @param {*} app
 */
export async function toLoadPromise(app) {
  // 做一个缓存
  if (app.loadPromise) return app.loadPromise
  return (app.loadPromise = Promise.resolve().then(async () => {
    app.status = LOADING_SOURCE_CODE
    const { bootstrap, mount, unmount } = await app.loadApp(app.customProps)
    app.status = NOT_BOOTSTRAPPED // 没有调用bootstrap方法
    Object.assign(app, {
      bootstrap: flatFnArray(bootstrap),
      mount: flatFnArray(mount),
      unmount: flatFnArray(unmount)
    })
    delete app.loadPromise
    return app
  }))
}
/**
 * @Author: wyb
 * @Descripttion: 多个方法组合成一个函数
 * @param {*} fns
 */
function flatFnArray(fns) {
  fns = Array.isArray(fns) ? fns : [fns]
  return props =>
    fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve())
}
