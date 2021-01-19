import {
  Vue
} from './install'

class Store {
  
  constructor(options) {
    const {
      state,
      getters,
      mutation,
      actions,
      module,
      strict
    } = options

    this._vm = new Vue({
      data: {
        $$state: state // $符开头的变量不会挂载到实例上 但会挂载到 _data 上
      }
    })

  }

  get state() {
    return this._vm._data.$$state
  }

}

export default Store