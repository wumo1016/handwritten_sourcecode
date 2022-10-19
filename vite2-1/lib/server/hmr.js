/**
 * @Author: wyb
 * @Descripttion: 文件变化时调用
 * @param {*} file
 * @param {*} server
 */
async function handleHMRUpdate(file, server) {
  const { moduleGraph, ws } = server
  const updateModule = moduleGraph.getModuleById(file)
  if (updateModule) {
    const updates = []
    const boundaries = new Set() // 向上更新的边界
    propagateUpdate(updateModule, boundaries)
    updates.push(
      ...[...boundaries].map(({ boundary, acceptedVia }) => ({
        type: `${boundary.type}-update`,
        path: boundary.url,
        acceptedPath: acceptedVia.url
      }))
    )
    ws.send({
      type: 'update',
      updates
    })
  }
}
/**
 * @Author: wyb
 * @Descripttion: 找到updateModule的边界，放到boundaries集合中
 * @param {*} updateModule
 * @param {*} boundaries
 */
function propagateUpdate(updateModule, boundaries) {
  if (!updateModule.importers.size) return
  // 循环引入当前模块的模块
  for (const importerModule of updateModule.importers) {
    // 看当前模块是否接受自己的变更
    if (importerModule.acceptedHmrDeps.has(updateModule)) {
      boundaries.add({
        boundary: importerModule, // 接受变更的模块
        acceptedVia: updateModule // 谁变更了
      })
    }
  }
}
exports.handleHMRUpdate = handleHMRUpdate

// 有限状态机
const LexerState = {
  inCall: 0, // 方法调用中
  inQuoteString: 1 // 在字符串中，引号里面就是1
}
/**
 * @Author: wyb
 * @Descripttion: 解析类似这样的字符串 import.meta.hot.accept(['./renderModule.js'] 拿到方括号中的文件
 * @param {*} code 模块源代码
 * @param {*} start 开始查找位置
 * @param {*} acceptedUrls 解析到热更新依赖后放到哪个集合里
 */
function lexAcceptedHmrDeps(code, start, acceptedUrls) {
  let state = LexerState.inCall
  let currentDep = '' // 当前的依赖名
  function addDep(endIndex) {
    acceptedUrls.add({
      url: currentDep, // 当前字符串
      start: endIndex - currentDep.length - 1, // 开始索引
      end: endIndex + 1 // 结束索引 + 1
    })
    currentDep = ''
  }
  for (let i = start, len = code.length; i < len; i++) {
    const char = code.charAt(i)
    switch (state) {
      case LexerState.inCall:
        if (char === `'` || char === `"`) {
          state = LexerState.inQuoteString
        }
        break
      case LexerState.inQuoteString:
        if (char === `'` || char === `"`) {
          addDep(i)
          state = LexerState.inCall
        } else {
          currentDep += char
        }
        break
    }
  }
}

exports.lexAcceptedHmrDeps = lexAcceptedHmrDeps

/* 
当一个模块发生变化的时候，会向上通知，如果有一个模块能够接收自己的改变，那么就到此为止
让此接收的模块执行回调，处理更新
如果一直向上通知，没有任何一个模块能接收，直接 刷新浏览器

如何处理冒泡的过程(所以需要建立一个模块依赖图)
- 我引入了谁 谁引入了我
- 知道哪些模块导入了哪些模块
- 知道父模块可以接受哪些子模块的变更
*/
