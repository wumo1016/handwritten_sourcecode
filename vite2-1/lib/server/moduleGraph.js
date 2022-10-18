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
  constructor(resolveId) {
    this.resolveId = resolveId
  }
  //模块ID和模块节点对象的映射关系
  idToModuleMap = new Map()
  //根据模块ID返回模块的节点对象
  getModuleById(id) {
    return this.idToModuleMap.get(id)
  }
  async ensureEntryFromUrl(rawUrl) {
    //vue  /src/main.js
    //先获得它的绝对路径
    const [url, resolveId] = await this.resolveUrl(rawUrl)
    let moduleNode = this.idToModuleMap.get(resolveId)
    if (!moduleNode) {
      moduleNode = new ModuleNode(url)
      this.idToModuleMap.set(resolveId, moduleNode)
    }
    return moduleNode
  }
  async resolveUrl(url) {
    const resolved = await this.resolveId(url)
    return [url, resolved.id || resolved]
  }
  async updateModuleInfo(importerModule, importedUrls, acceptedUrls) {
    //建立父子关系 让导入的模块imported Module，的importers包括importerModule
    for (const importedUrl of importedUrls) {
      const depModule = await this.ensureEntryFromUrl(importedUrl)
      //依赖的模块导入方是importerModule
      depModule.importers.add(importerModule) //让renderModule的importers里添加main.js
    }
    //维护接收的热更新依赖
    const acceptedHmrDeps = importerModule.acceptedHmrDeps
    for (const acceptedUrl of acceptedUrls) {
      //让main.js的acceptedHmrDeps里包括renderModule
      const acceptedModule = await this.ensureEntryFromUrl(acceptedUrl)
      acceptedHmrDeps.add(acceptedModule)
    }
  }
}
exports.ModuleGraph = ModuleGraph
