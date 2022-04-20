import { MOUNTED, MOUNTING, NOT_MOUNTED, shouldBeActive } from '../applications/app-helpers'

export async function toMountPromise(app) {
  if (app.status !== NOT_MOUNTED || !shouldBeActive(app)) return app
  app.status = MOUNTING
  await app.mount(app.customProps)
  app.status = MOUNTED
  return app
}
