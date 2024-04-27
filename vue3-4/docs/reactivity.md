## reactive

- 只有对象才可以被代理
- 如果被代理过 则直接返回
- 代理缓存

## effect

- computed、watch 都是基于 effect 实现的
- active: 是否是响应式
- run: 执行传入的函数
- stop: 停止响应式
- 参数
  - fn
  - options
    - scheduler: 数据变化后, 不执行默认渲染, 走自己的逻辑