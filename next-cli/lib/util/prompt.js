function getPromptModules() {
  return ['babel', 'router'].map((file) => require(`../promptModules/${file}`))
}

module.exports = {
  getPromptModules
}
