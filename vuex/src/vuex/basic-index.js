import {
  Vue
} from './install'
import {
  forEach
} from './util'

class Store {

  constructor(options) {
    const {
      state,
      getters,
      mutations,
      actions,
      module,
      strict
    } = options


    this.mutations = {}
    this.actions = {}
    this.getters = {}
    const computed = {}

    // 代理 getters
    forEach(getters, (fn, key) => {
      computed[key] = () => {
        return fn(this.state) // 为了 getter 的第一个参数是state
      }
      Object.defineProperty(this.getters, key, {
        get: () => this._vm[key]
      })
    })

    // 代理 mutations
    forEach(mutations, (fn, key) => {
      this.mutations[key] = payload => fn.call(this, this.state, payload)
    })

    // 代理 actions
    forEach(actions, (fn, key) => {
      this.actions[key] = payload => fn.call(this, this, payload)
    })

    this._vm = new Vue({
      data: {
        $$state: state // $符开头的变量不会挂载到实例上 但会挂载到 _data 上
      },
      computed
    })

  }

  get state() {
    return this._vm._data.$$state
  }

  // 类箭头函数 ES7
  commit = (type, payload) => {
    this.mutations[type](payload)
  }

  dispatch = (type, payload) => {
    this.actions[type](payload)
  }

}

export default Store