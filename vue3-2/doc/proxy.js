/* 
- 直接使用 只会触发了 aliasName get 却没有触发 name的 get 
- 这样就会导致 将来name改变的时候 就不会使页面重新渲染
- 原因是属性访问器中的this指向的是原对象 而不是 proxy
*/

const person = {
  name: 'zf',
  get aliasName() {
    return this.name + 'jg'
  }
}
const proxy = new Proxy(person, {
  get(target, key, receiver) {
    console.log(key)
    return target[key]
  },
  set(target, key, value, receiver) {
    console.log('这里可以通知effect重新执行', key)
    target[key] = value
    return true
  }
})
proxy.aliasName

const proxy1 = new Proxy(person, {
  get(target, key, receiver) {
    console.log(key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver)
  }
})
proxy1.aliasName
