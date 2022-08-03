import {
  computed,
  inject,
  effectScope,
  getCurrentInstance,
  reactive,
  toRefs,
  watch,
  isRef,
  isReactive,
  isReadonly
} from 'vue'
import { symbolPinia, isObject } from './util'
import { addSubscription, triggerSubscriptions } from './subcriptions'

export function defineStore(idOrOptions, setup) {
  let id, options
  if (typeof idOrOptions === 'string') {
    id = idOrOptions
    options = setup
  } else {
    id = idOrOptions.id
    options = idOrOptions
  }

  function useStore() {
    const currentInstance = getCurrentInstance()
    const pinia = currentInstance && inject(symbolPinia)

    // 应该做缓存 用户多次调用useStore 返回第一次创建的store
    if (!pinia._s.has(id)) {
      if (typeof setup === 'function') {
        createSetupStore(id, setup, pinia)
      } else {
        createOptionsStore(id, options, pinia)
      }
    }
    const store = pinia._s.get(id)
    return store
  }

  return useStore
}

function createOptionsStore(id, options, pinia) {
  const { state, getters, actions } = options
  function setup() {
    // 全局保存state
    pinia.state.value[id] = state ? state() : {}

    const localState = toRefs(pinia.state.value[id])
    return Object.assign(
      localState,
      actions,
      Object.keys(getters).reduce((memo, key) => {
        memo[key] = computed(() => {
          const store = pinia._s.get(id)
          return getters[key].call(store, store)
        })
        return memo
      }, {})
    )
  }

  const store = createSetupStore(id, setup, pinia)

  // 此方法只能用在optionsApi
  store.$reset = function () {
    const newState = state ? state() : {}
    store.$patch(state => {
      Object.assign(state, newState)
    })
  }
}

function createSetupStore(id, setup, pinia) {
  // 自己的独立的store 可以独立停止
  let scope
  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    return scope.run(() => setup())
  })

  let actionSubscriptions = []

  function $patch(partialStateOrMutator) {
    if (typeof partialStateOrMutator === 'function') {
      partialStateOrMutator(pinia.state.value[id])
    } else {
      merge(pinia.state.value[id], partialStateOrMutator)
    }
  }
  // 方便扩展
  const store = reactive({
    $patch,
    $subscribe(callback, options = {}) {
      scope.run(() => {
        watch(
          pinia.state.value[id],
          state => {
            callback(state)
          },
          options
        )
      })
    },
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $dispose() {
      scope.stop()
      actionSubscriptions = []
      pinia._s.delete(id)
    }
  })

  function wrapAction(action) {
    return function (...args) {
      let afterList = []
      let errorList = []
      function after(callback) {
        afterList.push(callback)
      }
      function onError(callback) {
        errorList.push(callback)
      }
      triggerSubscriptions(actionSubscriptions, { after, onError })
      let result
      try {
        result = action.call(store, ...args)
      } catch (e) {
        triggerSubscriptions(errorList, e)
      }
      if (result instanceof Promise) {
        return result
          .then(v => {
            triggerSubscriptions(afterList, v)
          })
          .catch(e => {
            triggerSubscriptions(errorList, e)
            return Promise.reject(e)
          })
      }
      return result
    }
  }

  const state = {}
  for (const key in setupStore) {
    const v = setupStore[key]
    if ((isRef(v) || isReactive(v)) && !isReadonly(v)) {
      state[key] = v
    }
    if (typeof v === 'function') {
      setupStore[key] = wrapAction(v)
    }
  }

  if (!pinia.state.value[id]) {
    pinia.state.value[id] = state
  }

  Object.assign(store, setupStore)
  pinia._s.set(id, store)

  Object.defineProperty(store, '$state', {
    get: () => pinia.state.value[id],
    set: state => $patch($state => Object.assign($state, state))
  })

  return store
}

function merge(target, state) {
  for (let key in state) {
    let oldValue = target[key]
    let newValue = state[key]
    if (isObject(oldValue) && isObject(newValue)) {
      target[key] = merge(oldValue, newValue)
    } else {
      target[key] = newValue
    }
  }
  return target
}
