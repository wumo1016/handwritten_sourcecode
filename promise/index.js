
// 1.js
// new MyPromise((r, j) => {
//   j(123)
// }).then((value) => {
//   console.log('成功', value);
// }, (e) => {
//   console.log('失败', e);
// })

// 2.js
new MyPromise((r, j) => {
  setTimeout(() => {
    r(123)
  }, 1500)
}).then((value) => {
  console.log('成功', value);
}, (e) => {
  console.log('失败', e);
})


/*
Promises/A+(https://promisesaplus.com/)
1.promise必须是一个对象或者函数，它必须有一个then方法
2.调用resolve和reject可以传入一个js值，或者一个promise
3.可以使用throw将promise状态改为失败状态
4.失败函数应该包含一个失败理由参数
5.一个promise应该包含三种状态 pending fulfilled rejected
6.状态一旦改变，不能再次更改
7.then方法可以访问成功和失败

实现步骤：
1.它是一个类
2.传入一个执行器函数 并且执行器立即执行 而且可能会出错
3.它有三种状态 pending fulfilled rejected
4.执行器函数接受两个函数resolve reject，用于改变状态(只有等待态的时候才能改变状态)
5.需要保存成功的value 和 失败的reason
6.如果执行器函数执行的时候抛出错误，也会将状态改为失败状态 调用reject
7.实例有一个then方法 课、可接受两个参数 onFulfilled onRejected
8.当调用then方法的时候 判断状态 成功就调用onFulfilled(传入成功value) 失败就调用onRejected(传入失败reason)
9.异步调用问题 需要在改变状态的时候 再调用相应的回调(发布订阅模式)
10.可以将相应的回调先保存起来 而且then可以调用多次 这就意味需要用一个数组保存成功回调和失败回调

*/
