import {
  mergeOptions
} from "../utils"

export function initGlobalApi(Vue) {
  Vue.options = {}

  Vue.mixin = function (options) {
    this.options = mergeOptions(this.options, options)
    return this
  }

  Vue.options._base = Vue

  Vue.options.components = {}
  Vue.component = function (key, options) {
    const childInstance = this.options._base.extend(options)
    this.options.components[key] = childInstance
  }

  Vue.extend = function (options) {
    const Super = this
    const Sub = function VueComponent() {
      this._init()
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.options = mergeOptions(Super.options, options)

    return Sub
  }
}