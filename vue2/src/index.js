import {
  initGlobalApi
} from "./global-api/index"
import {
  initMixin
} from "./init"
import {
  lifecycleMixin
} from "./lifecycle"
import {
  renderMixin
} from "./render"
import {
  stateMixin
} from "./state"



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

// diff
import {
  compileToFunction
} from "./compiler/index"
import {
  patch
} from "./vdom/patch"

let vm1 = new Vue({
  data: {
    meaasge1: 'hello',
    meaasge2: 'world',
  }
})

// 老节点
let oldTemplate = `<ul>
  <li key='a'>a</li>
  <li key='b'>b</li>
  <li key='c'>c</li>
  <li key='d'>d</li>
</ul>`
const render1 = compileToFunction(oldTemplate)
const oldVnode = render1.call(vm1)
const el1 = patch(null, oldVnode)

document.body.appendChild(el1)
// 新节点
setTimeout(() => {
  let newTemplate = `<ul>
    <li key='d'>d</li>
    <li key='b'>c</li>
    <li key='a'>b</li>
    <li key='c'>a</li>
  </ul>`
  const render2 = compileToFunction(newTemplate)
  const newVnode = render2.call(vm1)
  patch(oldVnode, newVnode)
}, 1000)