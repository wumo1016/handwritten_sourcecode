import {
  popTarget,
  pushTarget
} from "./dep"
import {
  queueWatcher
} from "./scheduler"

let id = 0

// 一个属性对应多个watcher
// 一个watcher可以对应多个属性

/**
 * @param exprOrFn: 1.对于renderWatcher 就是 updateComponent 
 *                  2.对于userWatcher 就是要监听的函数名 cb说就是回调函数
 */
class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    this.user = !!options.user // 是否是user watcher
    this.lazy = !!options.lazy // 如果是 computed lazy = true
    this.dirty = options.lazy // 如果是 computed dirty = true true就是需要重新求值
    this.cb = cb
    this.options = options
    this.id = id++
    this.deps = [] // 存放dep
    this.depsId = new Set()
    // user watcher传入的就是字符串
    if (typeof exprOrFn === 'string') {
      this.getter = function () {
        let path = exprOrFn.split('.') // 为了处理多级取值 obj.name.age
        let obj = vm
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]
        }
        return obj // 相当于取值，会触发依赖收集
      }
    } else {
      this.getter = exprOrFn
    }
    // 默认 exprOrFn 执行一次
    // this.value 对于 user wahcter 就是监听的值
    // 如果是computed 不主动执行
    this.value = this.lazy ? undefined : this.get() // 初始化
    return this.value
  }

  get() {
    pushTarget(this)
    const value = this.getter.call(this.vm)
    popTarget()
    return value
  }

  // queueWatcher(flushSchedulerQueue) 中调用的
  run() {
    const newValue = this.get()
    const oldValue = this.value
    if (this.user) { // user watcher 及其回调
      this.cb && this.cb.call(this.vm, newValue, oldValue)
    }
    this.value = newValue
  }
  // dep.notify() 调用
  update() {
    if (this.lazy) { // 等computed依赖的属性改变时，需要重新求值
      this.dirty = true
    }
    // 多次调用一个watcher，先缓存，等一会一起更新
    queueWatcher(this)
  }
  // Dep.depend()调用
  addDep(dep) { // 应该去重
    const id = dep.id
    if (!this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }
  // computed 需要求值时调用
  evaluate() {
    this.dirty = false
    this.value = this.get()
  }
  // 为了computed中依赖属性收集render watcher
  depend() {
    for (let i = 0; i < this.deps.length; i++) {
      this.deps[i].depend()
    }
  }
}

export default Watcher