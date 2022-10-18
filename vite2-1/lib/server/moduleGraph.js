/**
 * @Author: wyb
 * @Descripttion: 模块
 */
class ModuleNode {
  // 哪些模块导入的了自己
  importers = new Set()
  // 自己导入了哪些子模块 且 可以接收其中哪些模块的修改
  acceptedHmrDeps = new Set()
  constructor(url, type = 'js') {
    this.url = url
    this.type = type
  }
}
/**
 * @Author: wyb
 * @Descripttion: 模块关系映射
 */
class ModuleGraph {
  // 模块ID和模块节点对象的映射关系
  idToModuleMap = new Map()
  constructor(resolveId) {
    this.resolveId = resolveId
  }
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} id
   */
  getModuleById(id) {
    return this.idToModuleMap.get(id)
  }
  /**
   * @Author: wyb
   * @Descripttion: 根据url构建模块
   * @param {*} rawUrl
   */
  async ensureEntryFromUrl(rawUrl) {
    //先获得它的绝对路径
    const [url, resolveId] = await this.resolveUrl(rawUrl) // rawUrl => /src/main.js
    let moduleNode = this.getModuleById(resolveId)
    if (!moduleNode) {
      moduleNode = new ModuleNode(url)
      this.idToModuleMap.set(resolveId, moduleNode)
    }
    return moduleNode
  }
  /**
   * @Author: wyb
   * @Descripttion: 获取绝对路径
   * @param {*} url
   */
  async resolveUrl(url) {
    const resolved = await this.resolveId(url)
    return [url, resolved.id || resolved]
  }
  // async updateModuleInfo(importerModule, importedUrls, acceptedUrls) {
  //   //建立父子关系 让导入的模块imported Module，的importers包括importerModule
  //   for (const importedUrl of importedUrls) {
  //     const depModule = await this.ensureEntryFromUrl(importedUrl)
  //     //依赖的模块导入方是importerModule
  //     depModule.importers.add(importerModule) //让renderModule的importers里添加main.js
  //   }
  //   //维护接收的热更新依赖
  //   const acceptedHmrDeps = importerModule.acceptedHmrDeps
  //   for (const acceptedUrl of acceptedUrls) {
  //     //让main.js的acceptedHmrDeps里包括renderModule
  //     const acceptedModule = await this.ensureEntryFromUrl(acceptedUrl)
  //     acceptedHmrDeps.add(acceptedModule)
  //   }
  // }
}
exports.ModuleGraph = ModuleGraph
