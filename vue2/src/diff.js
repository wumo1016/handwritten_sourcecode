/* ----------- 标签不同 --------------- */
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
let oldTemplate = `<div>{{meaasge1}}</div>`
const render1 = compileToFunction(oldTemplate)
const oldVnode = render1.call(vm1)
const el1 = patch(null, oldVnode)

document.body.appendChild(el1)
// 新节点
setTimeout(() => {
  let newTemplate = `<p>{{meaasge2}}</p>`
  const render2 = compileToFunction(newTemplate)
  const newVnode = render2.call(vm1)
  patch(oldVnode, newVnode)
}, 1000)

/* -----------------标签相同，属性不同----------------- */

let oldTemplate = `<div style="color:red;background:gray;" a=1>{{meaasge1}}</div>`
let newTemplate = `<div style="color:blue;" b=2>{{meaasge2}}</div>`

/* ------------------------- diff1 -------------------------- */
let oldTemplate = `<ul>
  <li>a</li>
  <li a=1>b</li>
  <li>c</li>
  <li>d</li>
</ul>`
let newTemplate = `<div>
    <li>a</li>
    <li>123456</li>
    <li>c</li>
    <li>d</li>
  </div>`
/* ----------------- diff2 ---------------------- */
let oldTemplate = `<ul>
  <li>a</li>
  <li>b</li>
  <li>c</li>
  <li>d</li>
</ul>`

let newTemplate = `<ul>
    <li>a</li>
    <li>b</li>
    <li>c</li>
    <li>d</li>
    <li>e</li>
  </ul>`
/* ----------------- diff3 ---------------------- */
let oldTemplate = `<ul>
  <li key='a'>a</li>
  <li key='b'>b</li>
  <li key='c'>c</li>
  <li key='d'>d</li>
</ul>`

let newTemplate = `<ul>
    <li key='e'>e</li>
    <li key='a'>a</li>
    <li key='b'>b</li>
    <li key='c'>c</li>
    <li key='d'>d</li>
  </ul>`
/* ----------------- diff4 ---------------------- */
let oldTemplate = `<ul>
  <li key='a'>a</li>
  <li key='b'>b</li>
  <li key='c'>c</li>
  <li key='d'>d</li>
</ul>`

let newTemplate = `<ul>
    <li key='a'>a</li>
    <li key='b'>b</li>
    <li key='c'>c</li>
  </ul>`
/* ----------------- diff5 ---------------------- */
let oldTemplate = `<ul>
  <li key='a'>a</li>
  <li key='b'>b</li>
  <li key='c'>c</li>
  <li key='d'>d</li>
</ul>`

let newTemplate = `<ul>
    <li key='d'>d</li>
    <li key='c'>c</li>
    <li key='b'>b</li>
    <li key='a'>a</li>
  </ul>`

  /* ----------------- diff6 ---------------------- */
let oldTemplate = `<ul>
<li key='a'>a</li>
<li key='b'>b</li>
<li key='c'>c</li>
<li key='d'>d</li>
</ul>`

let newTemplate = `<ul>
  <li key='d'>d</li>
  <li key='c'>c</li>
  <li key='b'>b</li>
  <li key='a'>a</li>
</ul>`