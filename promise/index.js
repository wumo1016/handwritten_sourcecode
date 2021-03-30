/* ------------------ 1.js 同步改变状态 ------------------- */
// new MyPromise((r, j) => {
//   j(123)
// }).then((value) => {
//   console.log('成功', value);
// }, (e) => {
//   console.log('失败', e); // 失败 123
// })

/* ------------------ 2.js 异步改变状态 ------------------- */
// const promise = new MyPromise((r, j) => {
//   setTimeout(() => {
//     r(123)
//   }, 1500)
// })
// promise.then((value) => {
//   console.log('成功1', value); // 成功1 123
// }, (e) => {
//   console.log('失败', e);
// })
// promise.then((value) => {
//   console.log('成功2', value); // 成功2 123
// }, (e) => {
//   console.log('失败', e);
// })

/* -------------------------- 3.js romise的链式调用 ---------------------- */
// 情况1：then中返回的是一个普通值，而且这个返回值还会作为下一次then的成功结果(非promise)

// const promise = new MyPromise((r, j) => {
//   // 同步
//   // r(123)
//   // 异步
//   fetch('https://api.apiopen.top/getJoke?page=1&count=1&type=text').then(() => {
//     r(123)
//   })
// }).then((value) =>{
//   console.log('then1', value); // then1 123
//   return 456
// }, (e) => {
//   console.log('catch1', e);
// }).then(value => {
//   console.log('then2', value); // then2 123
// }, (e) => {
//   console.log('catch2', e);
// })

// const promise = new MyPromise((r, j) => {
//   fetch('https://api.apiopen.top/getJoke?page=1&count=1&type=text').then(() => {
//     j(123)
//   })
// }).then((value) =>{
//   console.log('then1', value);
//   return 456
// }, (e) => {
//   console.log('catch1', e); // catch1 123
// }).then(value => {
//   console.log('then2', value); // then2 undefined
// }, (e) => {
//   console.log('catch2', e);
// })

// 情况2：then中抛出异常 则会走下一个then的错误回调
// 但如果then没有定义错误回调 则会走到下一个then的错误回调

// const promise = new MyPromise((r, j) => {
//   fetch('https://api.apiopen.top/getJoke?page=1&count=1&type=text').then(() => {
//     r(123)
//   })
// }).then((value) =>{
//   console.log('then1', value); // then1 123
//   throw new Error(456)
//   return 456
// }, (e) => {
//   console.log('catch1', e);
//   return 789
// }).then(value => {
//   console.log('then2', value);
// }, (e) => {
//   console.log('catch2', e); // catch2 Error: 456
// })

// const promise = new MyPromise((r, j) => {
//   fetch('https://api.apiopen.top/getJoke?page=1&count=1&type=text').then(() => {
//     j(123)
//   })
// }).then((value) =>{
//   console.log('then1', value);
//   throw new Error(456)
//   return 456
// }).then(value => {
//   console.log('then2', value);
// }, (e) => {
//   console.log('catch2', e); // catch2 123
// })

// 情况3：then中返回一个新的promise 会根据这个promise的状态执行

// const promise = new MyPromise((r, j) => {
//   r(123)
//   // fetch('https://api.apiopen.top/getJoke?page=1&count=1&type=text').then(() => {
//   //   r(123)
//   // })
// }).then((value) =>{
//   return new MyPromise((r, j) => r(123))
// }).then(value => {
//   console.log('then1', value); // then1 123
// }, (e) => {
//   console.log('catch1', e);
// })

// const promise = new MyPromise((r, j) => {
//   fetch('https://api.apiopen.top/getJoke?page=1&count=1&type=text').then(() => {
//     r(123)
//   })
// }).then((value) =>{
//   return new Promise((r, j) => j(123))
// }).then(value => {
//   console.log('then1', value);
// }, (e) => {
//   console.log('catch1', e); // catch1 123
// })


// 情况4：then中返回的promise和x相同的情况
// const promise = new MyPromise((r, j) => {
//   r(123)
// }).then(value => {
//   return promise
// })

// promise.then(value => {
//   console.log(value);
// }, e => {
//   console.log(e);
// })
// 当执行第一个resolvePromise的时候 第一个then方法已经执行完毕 
// 此时 promise 就是then中返回的那个新的promise
// 此时又将新的promise返回作为返回值 故而 x === promise

// const promise = new MyPromise((r, j) => {
//   r(123)
// }).then(value => { 
//   return promise
// }).then(value => {
//   console.log(value);
// }, e => {
//   console.log(e);
// })
// 当执行第一个resolvePromise的时候 此时promise已经变成第二个then返回的新promise
// 所以第一个新promise不等

// 情况5：别人的promise可能可以多次更改状态
// 为了避免 我们需要对 做一个标记 记录这个用户的promise状态是否改变 如果已经改变 就不再改变
// 比如：别人的promise在then中没有判断 this.status 这样就是既执行成功回调又执行错误回调等等

/* -------------- 4.嵌套promise的情况 ----------------- */

// let promise2 = new MyPromise((resolve) => {
//   resolve(1);
// }).then(data => {
//   return new MyPromise((resolve, reject) => {
//     reject(new MyPromise((resolve, reject) => {
//       resolve('200');
//     }))
//   })
// })

// promise2.then(data => {
//   console.log(data)
// }, err => {
//   console.log('error', err)
// });

/* ------------------ 5.then中的参数可选 值的穿透 ------------------------- */

// new MyPromise((resolve, reject) => {
//   reject(200)
// }).then().then(null, (e) => {
//   console.log(e, 'reject1')
// }).then((data) => {
//   console.log(data, 'resolve')
// }, err => {
//   console.log(err, 'reject')
// })


/* ------------------ 6.一个promise直接resolve一个promise ------------------ */
// new Promise((resolve, reject) => {
//   reject(new Promise((resolve, reject) => {
//     resolve(123)
//   }))
// }).then((value) => {
//   console.log('resolve', value);
// }, (e) => {
//   console.log('reject', e)
// })

/* ------------------ 7.resolve reject catch all finally -------------- */
// MyPromise.resolve 等价于  new Promise((resolve, reject) => resolve)

// MyPromise.resolve(100).then((value) => {
//   console.log('resolve', value); // resolve 100
// })

// MyPromise.reject(100).then((value) => {
//   console.log('resolve', value);
// }, (e) => {
//   console.log('reject', e); // reject 100
// })

// new MyPromise((r, j) => j(123)).then(() => {}).catch(e => {
//   console.log(e); // 123
// })

// MyPromise.all([
//   new MyPromise((r, j) => {
//     setTimeout(() => {
//       r(2)
//     }, 500);
//   }),
//   new MyPromise((r, j) => {
//     setTimeout(() => {
//       r(1)
//     }, 1000);
//   }),
// ]).then(value => {
//   console.log('resolve', value);
// }).catch(e => {
//   console.log('reject', e);
// })





