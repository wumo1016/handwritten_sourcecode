import { initGlobalApi } from "./global-api/index"
import {
  initMixin
} from "./init"
import {
  lifecycleMixin
} from "./lifecycle"
import {
  renderMixin
} from "./render"
import { stateMixin } from "./state"


function Vue(options) {
  this._init(options)
}
// 扩展原型方法
initMixin(Vue)
renderMixin(Vue) // _render
lifecycleMixin(Vue) // _update
stateMixin(Vue)

// 扩展类方法 就是Vue的静态方法
initGlobalApi(Vue)

export default Vue