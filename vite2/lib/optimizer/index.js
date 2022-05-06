const scanImports = require('./scan')

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*}
 */
async function createOptimizerDepsRun(config) {
  const deps = await scanImports(config)
  /* 
  {
    vue: 'E:/wumo/handwritten_sourcecode/vite2/test/node_modules/vue/dist/vue.runtime.esm-bundler.js'
  }
  */
  console.log(deps)
}

exports.createOptimizerDepsRun = createOptimizerDepsRun
