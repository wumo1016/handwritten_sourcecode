function getPromptModules(){
  return ['vueVersion'].map(file => require(`../promptModules/${file}`))
}

module.exports = {
  getPromptModules
}