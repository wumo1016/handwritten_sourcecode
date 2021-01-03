import {
  initMixin
} from "./init"

window.log = console.log

function Vue(options) {
  this._init(options)
}
// 扩展原型方法
initMixin(Vue)

export default Vue