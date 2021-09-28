import { forEachValue } from '../utils'

export default class Module {
  constructor(rawModule) {
    this._raw = rawModule
    this.state = rawModule.state
    this._children = {}
    this.namespaced = rawModule.namespaced // 是否有命名空间
  }

  addChild(key, module) {
    this._children[key] = module
  }

  getChild(key) {
    return this._children[key]
  }

  forEachChild(fn) {
    forEachValue(this._children, fn)
  }

  forEachGetter(fn) {
    const getters = this._raw.getters
    getters && forEachValue(getters, fn)
  }

  forEachMutation(fn) {
    const mutations = this._raw.mutations
    mutations && forEachValue(mutations, fn)
  }

  forEachAction(fn) {
    const actions = this._raw.actions
    actions && forEachValue(actions, fn)
  }
}
