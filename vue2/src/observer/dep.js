// 每个属性分配一个dep dep用来存放watcher watcher也要妨dep
let id = 0
class Dep {
  constructor() {
    this.id = id++
    this.subs = [] // 用来存放 watcher
  }
  // 将 watcher 存入dep
  // 将 dep 存入watcher
  depend(){
    Dep.target.addDep(this)
  }
  addSub(watcher){
    this.subs.push(watcher)
  }
  notify(newValue, value){
    this.subs.forEach(watcher => watcher.update(newValue, value))
  }
}

Dep.target = null

export function pushTarget(watcher) {
  Dep.target = watcher
}

export function popTarget() {
  Dep.target = null
}

export default Dep