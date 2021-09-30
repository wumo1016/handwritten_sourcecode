import { inject } from 'vue'
import Store from './store'

const DefaultKey = 'DefaultStoreKey'

function createStore(options) {
  return {
    install(app, key = DefaultKey) {
      const store = new Store(options)
      app.provide(key, store)
    }
  }
}

function useStore(key = DefaultKey) {
  return inject(key)
}

export { createStore, useStore }
