const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(new TypeError('错误'))
  }
  if (typeof x === 'object' && x !== null || typeof x === 'function') {
    let called = false
    try {
      let then = x.then
      if (typeof then === 'function') { // 当作promise处理
        then.call(x, y => {
          if (called) return
          called = true
          resolvePromise(promise, y, resolve, reject)
        }, r => {
          if (called) return
          called = true
          reject(r)
        })
      } else { // 当作普通值处理
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else { // 普通值 直接resolve即可
    resolve(x)
  }
}

class MyPromise {
  constructor(executor) {
    this.status = PENDING // 默认状态

    this.value = undefined // 成功的原因
    this.reason = undefined // 失败的原因

    this.onResolvedCallbacks = [] // 存放成功的回调
    this.onRejectedCallbacks = [] // 存放失败的回调

    // 改为成功状态
    const resolve = (value) => {
      if (this.status === PENDING) {
        this.value = value
        this.status = FULFILLED
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }
    // 改为失败状态
    const reject = (reason) => {
      if (this.status === PENDING) {
        this.reason = reason
        this.status = REJECTED
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }
  // 由于需要拿到回调函数的返回结果 所以直接将判断写入返回的promise内
  // todo onFulfilled/onRejected 未定义的情况
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : e => {
      throw e
    }
    const promise = new MyPromise((resolve, reject) => {
      if (this.status === PENDING) { // resolve或reject是异步调用的
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
      } else if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
    })
    return promise
  }
}

module.exports = MyPromise

// https://github.com/promises-aplus/promises-tests
// 安装测试包 npm i promises-aplus-tests -g
// 测试，直接在终端你跑 promises-aplus-tests test.js

MyPromise.deferred = function () {
  let dfd = {}
  dfd.promise = new MyPromise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}