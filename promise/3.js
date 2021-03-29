const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

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
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      if (this.status === PENDING) { // resolve或reject是异步调用的
        this.onResolvedCallbacks.push(() => {
          let resolveResult = onFulfilled(this.value)
          resolve(resolveResult)
        })
        this.onRejectedCallbacks.push(() => {
          let rejectResult = onRejected(this.reason)
          reject(rejectResult)
        })
      } else if (this.status === FULFILLED) {
        let resolveResult = onFulfilled(this.value)
        resolve(resolveResult)
      } else if (this.status === REJECTED) {
        let rejectResult = onRejected(this.reason)
        reject(rejectResult)
      }
    })
  }
}