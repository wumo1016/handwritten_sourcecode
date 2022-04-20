import {
  BOOTSTRAPPING,
  NOT_BOOTSTRAPPED,
  NOT_MOUNTED,
  shouldBeActive
} from '../applications/app-helpers'

export async function toBootstarpPromise(app) {
  if (app.status !== NOT_BOOTSTRAPPED || !shouldBeActive(app)) return app
  app.status = BOOTSTRAPPING
  await app.bootstrap(app.customProps)
  app.status = NOT_MOUNTED
  return app
}
