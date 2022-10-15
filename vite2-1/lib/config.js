async function resolveConfig() {
  const root = process.cwd()
  let config = {
    root
  }
  return config
}

module.exports = resolveConfig
