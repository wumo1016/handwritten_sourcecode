import Store from './store'
import { useStore } from './injectKey'

function createStore(options) {
  return new Store(options)
}

export { createStore, useStore }
