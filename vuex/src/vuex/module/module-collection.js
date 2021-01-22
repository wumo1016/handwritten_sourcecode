import {
  forEach
} from "../util"
import Module from "./module";

class ModuleCollection {

  constructor(options) {

    this.root = null
    const r = this.register([], options)
    // console.log(r);
  }

  // path 记录父子关系
  register(path, rawModule) {

    const newModule = new Module(rawModule)

    if (path.length === 0) {
      this.root = newModule
    } else {
      // 根据当前注册的key 将其注册到父的 _children 中去
      const parent = path.slice(0, -1).reduce((memo, key) => {
        return memo.getChild(key)
      }, this.root)
      parent.addChild(path[path.length - 1], newModule)
    }

    if (rawModule.modules) {
      forEach(rawModule.modules, (module, key) => {
        this.register(path.concat(key), module)
      })
    }

    return newModule
  }
}

export default ModuleCollection