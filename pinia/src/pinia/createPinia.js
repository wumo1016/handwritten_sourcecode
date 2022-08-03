import { effectScope, ref } from 'vue'
import { symbolPinia } from './util'

export function createPinia() {
  // const state = ref({})
  const scope = effectScope() //scope.stop()
  const state = scope.run(() => ref({})) // reactive()

  const _p = []

  const pinia = {
    install(app) {
      app.provide(symbolPinia, pinia)
    },
    use(plugin) {
      _p.push(plugin)
      return this
    },
    state, // 维护所有store状态
    _s: new Map(),
    _e: scope,
    _p
  }

  return pinia
}
