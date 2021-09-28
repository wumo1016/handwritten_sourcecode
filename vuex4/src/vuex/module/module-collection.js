import { forEachValue } from '../utils'
import Module from './module'

export default class ModuleCollection {
  constructor(rootModule) {
    this.root = null
    this.register(rootModule, [])
  }
  /**
   * @Descripttion: 递归注册模块 构建父子关系
   * @param {*} rawModule 未格式化的元数据
   * @param {*} path
   */
  register(rawModule, path, parent) {
    const newModule = new Module(rawModule)
    // 说明是根模块
    if (path.length === 0) {
      this.root = newModule
    } else {
      parent.addChild(path[path.length - 1], newModule)
    }
    // 递归
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (key, rawChildModule) => {
        this.register(rawChildModule, path.concat(key), newModule)
      })
    }
  }

  getNamespaced(path) {
    let module = this.root
    return path.reduce((namespacedStr, key) => {
      module = module.getChild(key) // 子模块
      return namespacedStr + (module.namespaced ? key + '/' : '')
    }, '')
  }
}
