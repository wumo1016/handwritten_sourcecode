import { forEach } from "../util"

class Module {

  constructor(rawModule) {
    this._raw = rawModule // 用户定义的原始模块数据
    this._children = {}
    this.state = rawModule.state // 当前模块状态
  }

  getChild(key) {
    return this._children[key]
  }

  addChild(key, module) {
    this._children[key] = module
  }

  forEachGetter(cb) {
    forEach(this._raw.getters, cb)
  }

  forEachMutation(cb) {
    forEach(this._raw.mutations, cb)
  }

  forEachAction(cb) {
    forEach(this._raw.actions, cb)
  }

  forEachChildren(cb){
    forEach(this._children, cb)
  }

  get namespaced(){
    return !!this._raw.namespaced
  }

}

export default Module