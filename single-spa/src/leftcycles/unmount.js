import { MOUNTED, NOT_MOUNTED, UNMOUNTING } from '../applications/app-helpers'

export async function toUnmountPromise(app) {
  // 如果应用没有被挂载 则不需要卸载
  if (app.status !== MOUNTED) {
    return app
  }
  app.status = UNMOUNTING // 卸载中
  await app.unmount(app.customProps)
  app.status = NOT_MOUNTED
  return app
}
