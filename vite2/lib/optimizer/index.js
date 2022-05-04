const scanImports = require('./scan')

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*}
 */
async function createOptimizerDepsRun(config) {
  const desp = scanImports(config)
}

exports.createOptimizerDepsRun = createOptimizerDepsRun
