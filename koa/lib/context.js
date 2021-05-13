const context = {
}

function defineGetter(target, key) {
  context.__defineGetter__(key, function () {
    return this[target][key]
  })
}

defineGetter('request', 'query')
defineGetter('request', 'path')

module.exports = context