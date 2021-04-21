/* ----------------- case: 同步改变状态 ---------------------- */

// new MyPromise((r, j) => {
//   r(123)
// }).then(value => {
//   console.log('resolve', value); // resolve 123
// }, e => {
//   console.log('reject', e);
// })

// new MyPromise((r, j) => {
//   j(123)
// }).then(value => {
//   console.log('resolve', value);
// }, e => {
//   console.log('reject', e); // reject 123
// })

/* ----------------- case: executor执行出错 ---------------------- */

// new MyPromise((r, j) => {
//   throw new Error(123);
// }).then(value => {
//   console.log('resolve', value);
// }, e => {
//   console.log('reject', e); // reject Error: 123
// })

/* ------------------ case: 异步改变状态 ------------------------ */

// new MyPromise((r, j) => {
//   setTimeout(() => {
//     r(123)
//   }, 1000)
// }).then(value => {
//   console.log('resolve', value); // resolve 123
// }, e => {
//   console.log('reject', e);
// })

// new MyPromise((r, j) => {
//   setTimeout(() => {
//     j(123)
//   }, 1000)
// }).then(value => {
//   console.log('resolve', value);
// }, e => {
//   console.log('reject', e); // reject 123
// })

/* ------------------ case: then中返回当前promise ------------------ */

// const p1 = new MyPromise((r, j) => {
//   r(123)
// }).then(value => {
//   console.log('resolve1', value); // resolve1 123
//   return p1
// }, e => {
//   console.log('reject1', e);
// })
// p1.then(value => {
//   console.log('resolve2', value); // Uncaught TypeError: Chaining cycle detected for promise #<Promise>
// })

// 当执行第一个resolvePromise的时候 第一个then方法已经执行完毕 
// 此时 promise 就是then中返回的那个新的promise
// 此时又将新的promise返回作为返回值 故而 x === promise

/* ------------------- case: then中返回普通值 ----------------------- */

// new MyPromise((r, j) => {
//   r(123)
// }).then(value => {
//   console.log('resolve1', value); // resolve1 123
//   return 456
// }, e => {
//   console.log('reject1', e);
// }).then(value => {
//   console.log('resolve2', value); // resolve2 456
// })

// new MyPromise((r, j) => {
//   j(123)
// }).then(value => {
//   console.log('resolve1', value);
// }, e => {
//   console.log('reject1', e); // reject1 123
//   return 456
// }).then(value => {
//   console.log('resolve2', value); // resolve2 456
// })

/* ------------------- case: then中抛出错误 ------------------ */

// const promise = new MyPromise((r, j) => {
//   r(123)
// }).then((value) => {
//   console.log('then1', value); // then1 123
//   throw new Error(456)
//   return 456
// }, (e) => {
//   console.log('reject1', e);
//   return 789
// }).then(value => {
//   console.log('then2', value);
// }, (e) => {
//   console.log('reject2', e); // reject2 Error: 456
// })

/* -------------------- case: then中返回一个新的promise -----------  */

// new MyPromise((r, j) => {
//   r(123)
// }).then((value) => {
//   return new MyPromise((r, j) => r(123))
// }).then(value => {
//   console.log('then1', value); // then1 123
// }, (e) => {
//   console.log('reject1', e);
// })

// new MyPromise((r, j) => {
//   r(123)
// }).then((value) => {
//   return new MyPromise((r, j) => j(123))
// }).then(value => {
//   console.log('then1', value);
// }, (e) => {
//   console.log('reject1', e); // reject1 123
// })

/* ------------------ case: 嵌套promise的情况 ----------------------- */

// let promise2 = new MyPromise((resolve) => {
//   resolve(1);
// }).then(data => {
//   return new MyPromise((resolve, reject) => {
//     resolve(new MyPromise((resolve, reject) => {
//       resolve('200');
//     }))
//   })
// })

// promise2.then(value => {
//   console.log('then1', value); // then1 200
// }, err => {
//   console.log('reject', err)
// });

/* ----------------- case: then中参数可选 值的穿透 ------------------ */

// new MyPromise((resolve, reject) => {
//   resolve(200)
// }).then().then().then(value => {
//   console.log('resolve', value) // resolve 200
// }, e => {
//   console.log('reject', e)
// })

// new MyPromise((resolve, reject) => {
//   reject(200)
// }).then().then(null, e => {
//   console.log('reject1', 1) // 200 "reject1"
// }).then(value => {
//   console.log('resolve', value) // resolve undefined
// }, e => {
//   console.log('reject2', e)
// })

/* ------------ case: 一个promise直接resolve一个promise ------------- */

// new MyPromise((resolve, reject) => {
//   resolve(new MyPromise((resolve, reject) => {
//     resolve(123)
//   }))
// }).then((value) => {
//   console.log('resolve', value);
// }, (e) => {
//   console.log('reject', e)
// })

// new MyPromise((resolve, reject) => {
//   reject(new MyPromise((resolve, reject) => {
//     resolve(123)
//   }))
// }).then((value) => {
//   console.log('resolve', value);
// }, (e) => {
//   console.log('reject', e)
// })


/* ------------------ case: 一些静态和原型方法 -------------- */

/* resolve */

// MyPromise.resolve(100).then((value) => {
//   console.log('resolve', value); // resolve 100
// })

/* reject */

// MyPromise.reject(100).then(value => {
//   console.log('resolve', value);
// }, e => {
//   console.log('reject', e); // reject 100
// })

/* cacth */

// new MyPromise((r, j) => j(123)).then(() => {}).catch(e => {
//   console.log('catch', e); // catch 123
// })

/* all */
// 所有都成功才会走then

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
//   3
// ]).then(value => {
//   console.log('resolve', value);
// }).catch(e => {
//   console.log('reject', e);
// })

/* finally */

// 无论成功失败，最终都会执行
// 如果返回的普通值或成功的promise，后面都会采用前面的结果
// 只有返回失败的promise，才会把结果传到后面

// new MyPromise((r, j) => {
//   setTimeout(() => {
//     r(123)
//   }, 1000);
// }).then(value => {
//   console.log('then1', value); // then1 123
//   return 456
// }).finally(value => {
//   console.log('finally1', value); // finally undefined
// }).finally(value => {
//   console.log('finally2', value); // finally undefined
// }).then(value => {
//   console.log('then2', value); // then2 123
// }).catch(e => {
//   console.log('catch', e);
// })

// new MyPromise((r, j) => {
//   j(123)
// }).finally(value => {
//   console.log('finally1', value); // finally undefined
// }).finally(value => {
//   console.log('finally2', value); // finally undefined
// }).then(value => {
//   console.log('then1', value);
// }).catch(e => {
//   console.log('catch', e); // catch 123
// })

// new MyPromise((r, j) => {
//   r(123)
// }).finally(value => {
//   console.log('finally1', value); // finally undefined
// }).finally(value => {
//   console.log('finally2', value); // finally undefined
//   return new Promise((r, j) => {
//     r(456)
//   })
// }).then(value => {
//   console.log('then2', value); // then2 123
// }).catch(e => {
//   console.log('catch', e);
// })

// new Promise((r, j) => {
//   r(123)
// }).finally(value => {
//   console.log('finally1', value); // finally undefined
// }).finally(value => {
//   console.log('finally2', value); // finally undefined
//   return new Promise((r, j) => {
//     j(123)
//   })
// }).then(value => {
//   console.log('then2', value);
// }).catch(e => {
//   console.log('catch', e); // catch 123
// })


/* race */
// 返回第一个改变状态的promise

// MyPromise.race([
//   new MyPromise((r, j) => {
//     setTimeout(() => {
//       r(2)
//     }, 500);
//   }),
//   new MyPromise((r, j) => {
//     setTimeout(() => {
//       j(1)
//     }, 200);
//   }),
// ]).then(value => {
//   console.log('resolve', value);
// }).catch(e => {
//   console.log('reject', e); // reject 1
// })

/* any */
// 只要有一个成功就返回成功的 否则走catch

// MyPromise.any([
//   new MyPromise((r, j) => {
//     setTimeout(() => {
//       j(2)
//     }, 500);
//   }),
//   new MyPromise((r, j) => {
//     setTimeout(() => {
//       j(1)
//     }, 200);
//   }),
// ]).then(value => {
//   console.log('resolve', value); // resolve 2
// }).catch(e => {
//   console.log('reject', e);
// })

/* allSettled */
// 包含所有promise的状态和值

// MyPromise.allSettled([
//   new MyPromise((r, j) => {
//     setTimeout(() => {
//       r(2)
//     }, 500);
//   }),
//   new MyPromise((r, j) => {
//     setTimeout(() => {
//       j(1)
//     }, 200);
//   }),
//   123
// ]).then(value => {
//   console.log('resolve', value);
// })

/* ---------------- case: 超时处理 ------------------- */

// let p1 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve('resolve')
//   }, 3000)
// })

// function wrap(p1){
//   let abort;
//   let p = new Promise((resolve, reject) => {
//     abort = reject
//   })
//   let p2 = Promise.race([p, p1])
//   p2.abort = abort
//   return p2
// }

// let p2 = wrap(p1)

// p2.then(value => {
//   console.log('resolve', value);
// }, e => {
//   console.log('reject', e);
// })

// setTimeout(() => {
//   p2.abort('超过了1s')
// }, 1000)



/* -------------------------------------------------- */
Promise.resolve().then(() => { // then1
    console.log('then1');
    Promise.resolve().then(() => {
      console.log('then1-1');
      return Promise.resolve(); // 如果then中的方法返回了一个promise 会发生什么？  x.then().then()
    }).then(() => {
      console.log('then1-2')
    })
  })
  .then(() => {
    console.log('then2');
  })
  .then(() => {
    console.log('then3');
  })
  .then(() => {
    console.log('then4');
  })
  .then(() => {
    console.log('then5');
  })

// 浏览器规定 如果return了promise 会额外开辟一个异步方法(相当于又多了一次then)