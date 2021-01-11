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
    const Sub = function VueComponent(options) {
      this._init(options)
    }
    // 只会继承原型上的属性和方法
    // 而且不能直接设置 Sub.prototype = Super.prototype 因为这样后续对 Sub.prototype 的修改将会影响到 Super.prototype
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    
    Sub.options = mergeOptions(Super.options, options)

    return Sub
  }
}