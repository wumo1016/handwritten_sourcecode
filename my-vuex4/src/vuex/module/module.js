export default class Module {
  constructor(rawModule) {
    this._raw = rawModule
    this._state = rawModule.state
    this._children = {}
  }

  getChild(key) {
    return this._children[key]
  }

  addChild(key, module) {
    this._children[key] = module
  }
}
