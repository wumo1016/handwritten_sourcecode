import { forEachObj } from '../utils'

export default class Module {
  constructor(rawModule) {
    this._raw = rawModule
    this._state = rawModule.state
    this._children = {}
    this.namespaced = rawModule.namespaced
  }

  getChild(key) {
    return this._children[key]
  }

  addChild(key, module) {
    this._children[key] = module
  }

  forEachChild(fn) {
    forEachObj(this._children, fn)
  }

  forEachGetter(fn) {
    forEachObj(this._raw.getters || {}, fn)
  }
}
