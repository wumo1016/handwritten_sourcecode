const oldArrayPrototype = Array.prototype
// arrayMethods.__proto__ = Array.prototype
export const arrayMethods = Object.create(oldArrayPrototype)

const methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice',
]
methods.forEach(method => {

  arrayMethods[method] = function (...args) {
    oldArrayPrototype[method].call(this, ...args)
    let inserted
    let ob = this.__ob__ // 拿到了Observer中定义的this
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
      default:
        break
    }
    // 如果有新增的内容，继续劫持
    if (inserted) {
      ob.observeArray(observeArray)
    }
  }

})