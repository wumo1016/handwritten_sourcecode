promise主要解决了什么问题
1.可以链式调用(解决了嵌套回调的问题)
2.同步并发

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

11.为了避免promise回调嵌套，可以实现链式调用,所以就需要then方法返回一个新的promise(因为原来的promise状态已经改变)
12.如果上一个then的返回值(无论成功回调返回的还是失败回调返回的)是一个普通值(不是promise)，会作为下一个then的回调的参数
13.如果then中方法出错(例如抛出异常)，就需要对所有的回调进行try catch包装 将错误信息作为下一个失败回调的参数
14.如果then返回的是一个promise对象，那就需要根据promise的结果来处理走成功还是失败
15.处理返回值是promise的情况,鉴于有很多重复的情况，所以可以将其抽离成公共方法resolvePromise
   而且无法在前执行栈中取得返回promise的值，因为赋值是执行右侧的语句再赋值
   这里就可以使用微任务(MutationObserver和process.nextTick)和宏任务(setTimeout和setImmediate(仅IE))来包裹
   包裹的时候注意需要将try catch包裹在内 因为 try catch 只能捕获同步错误
16.处理resolvePromise
   -首先考虑promise返回值与promise相等的情况
   -然后还有可能是对象或函数,且包含then方法，否则捕获错误走错误处理
    Object.defineProperty(obj, 'then', {
      get(){
        throw new Error()
      }
    })
      -then是一个函数，调用它
        -如果别人的promise promise可能可以更改多次
      -then不是函数，直接resolve(x)，当作普通值处理
   -最后就是普通值了