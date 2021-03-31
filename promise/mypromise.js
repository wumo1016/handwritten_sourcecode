const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  if (typeof x === 'object' && x !== null || typeof x === 'function') {
    let called = false
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return
          called = true
          resolvePromise(promise, y, resolve, reject)
        }, r => {
          if (called) return
          called = true
          reject(r)
        })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }

}

class MyPromise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onFulfilledCbs = []
    this.onRejectedCbs = []

    const resolve = value => {
      if (value instanceof MyPromise) {
        return value.then(resolve, reject)
      }
      if (this.status === PENDING) {
        this.value = value
        this.status = FULFILLED
        this.onFulfilledCbs.forEach(cb => cb())
      }
    }

    const reject = reason => {
      if (this.status === PENDING) {
        this.reason = reason
        this.status = REJECTED
        this.onRejectedCbs.forEach(cb => cb())
      }
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }

  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : e => {
      throw e
    }
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      } else {
        this.onFulfilledCbs.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
        this.onRejectedCbs.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
      }
    })
    return promise2
  }

  catch (fn) {
    return this.then(null, e => fn(e))
  }

  static resolve(value) {
    return new MyPromise((resolve, reject) => resolve(value))
  }

  static reject(value) {
    return new MyPromise((resolve, reject) => reject(value))
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      let result = []
      let i = 0

      const processResult = (index, value) => {
        result[index] = value
        if (++i === promises.length) {
          resolve(result)
        }
      }

      for (let index = 0; index < promises.length; index++) {
        const p = promises[index]
        if (p.then && typeof p.then === 'function') {
          p.then(value => {
            processResult(index, value)
          }).catch(e => reject(e))
        } else {
          processResult(index, p)
        }
      }
    })
  }

  finally(fn) {
    this.onFulfilledCbs.push(fn)
    this.onRejectedCbs.push(fn)
    return this
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      for (let index = 0; index < promises.length; index++) {
        const p = promises[index]
        if (p.then && typeof p.then === 'function') {
          p.then(value => {
            resolve(value)
          }).catch(e => reject(e))
        } else {
          resolve(p)
        }
      }
    })
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      let i = 0
      const processResult = (index, value) => {
        if (++i === promises.length) {
          reject('AggregateError: All promises were rejected')
        }
      }

      for (let index = 0; index < promises.length; index++) {
        const p = promises[index]
        if (p.then && typeof p.then === 'function') {
          p.then(value => {
            resolve(value)
          }).catch(e => {
            processResult(index, e)
          })
        } else {
          resolve(value)
        }
      }
    })
  }

  static allSettled(promises) {
    return new MyPromise(resolve => {
      let result = []
      let i = 0

      const processResult = (index, value) => {
        result[index] = value
        if (++i === promises.length) {
          resolve(result)
        }
      }

      for (let index = 0; index < promises.length; index++) {
        const p = promises[index]
        if (p.then && typeof p.then === 'function') {
          p.then(value => {
            processResult(index, {
              status: 'fulfilled',
              value
            })
          }).catch(e => {
            processResult(index, {
              status: 'rejected',
              reason: e
            })
          })
        } else {
          processResult(index, {
            status: 'fulfilled',
            value: p
          })
        }
      }
    })
  }
}