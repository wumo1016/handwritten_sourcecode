// 每个属性分配一个dep dep用来存放watcher watcher也要妨dep
let id = 0
class Dep {
  constructor() {
    this.id = id++
    this.subs = [] // 用来存放 watcher
  }
  // 将 watcher 存入dep
  // 将 dep 存入watcher
  depend() {
    Dep.target.addDep(this)
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null

const stack = []
export function pushTarget(watcher) {
  Dep.target = watcher
  stack.push(watcher)
}

export function popTarget() {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}

export default Dep