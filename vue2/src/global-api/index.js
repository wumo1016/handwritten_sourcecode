import { mergeOptions } from "../utils"

export function initGlobalApi(Vue) {
  Vue.options = {}
  Vue.mixin = function(options){
    this.options = mergeOptions(this.options, options)
    // log(this.options)
    return this
  }
}