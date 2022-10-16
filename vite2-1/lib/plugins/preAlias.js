/**
 * @Author: wyb
 * @Descripttion: 寻找第三方插件
 */
function preAlias() {
  let server
  return {
    name: 'preAlias',
    configureServer(_server) {
      server = _server
    },
    resolveId(id) {
      const isOptimized = server._optimizeDepsMetadata?.optimized?.[id]
      if (isOptimized) {
        return {
          id: isOptimized.file
        }
      }
    }
  }
}
module.exports = preAlias
