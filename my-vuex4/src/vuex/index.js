import { inject } from 'vue'
import Store from './store'
import { DefaultKey } from './utils'

function createStore(options) {
  return new Store(options)
}

function useStore(key = DefaultKey) {
  return inject(key)
}

export { createStore, useStore }
