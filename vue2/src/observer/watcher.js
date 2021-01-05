import {
  popTarget,
  pushTarget
} from "./dep"

let id = 0

// 一个属性对应多个watcher
// 一个watcher可以对应多个属性

class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    this.cb = cb
    this.options = options
    this.id = id++
    this.deps = [] // 存放dep
    this.depsId = new Set()

    // 默认 exprOrFn 执行一次
    this.getter = exprOrFn
    this.get() // 初始化
  }

  get() {
    pushTarget(this)
    this.getter()
    popTarget()
  }

  update(){
    this.get()
  }

  addDep(dep) { // 应该去重
    const id = dep.id
    if (!this.depsId.has(id)) {
      this.depsId.add(id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }
}

export default Watcher
