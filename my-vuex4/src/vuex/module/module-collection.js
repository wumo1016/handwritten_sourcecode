import { forEachObj } from '../utils'
import Module from './module'

export default class ModuleCollection {
  constructor(options) {
    this.root = null
    this.register(options, [])
  }

  register(rawModule, path) {
    const newModule = new Module(rawModule)
    if (path.length === 0) {
      this.root = newModule
    } else {
      const parent = path
        .slice(0, -1)
        .reduce((module, curPath) => module.getChild(curPath), this.root)
      parent.addChild(path[path.length - 1], newModule)
    }

    // 递归构建关系
    const modules = rawModule.modules
    if (modules) {
      forEachObj(modules, (key, module) => {
        this.register(module, path.concat(key))
      })
    }
  }
  // aCount/cCount/
  getNamespaced(path) {
    let module = this.root
    return path.reduce((paths, curPath) => {
      module = module.getChild(curPath)
      return paths + (module.namespaced ? curPath + '/' : '')
    }, '')
  }
}
