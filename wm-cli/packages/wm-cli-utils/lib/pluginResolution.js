const pluginRE = /^(@vue\/|vue-|@[\w-]+(\.)?[\w-]+\/vue-)cli-plugin-/

exports.isPlugin = id => pluginRE.test(id)