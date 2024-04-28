## reactive

- 备注
  - 只有对象才可以被代理
  - 如果被代理过 则直接返回
  - 代理缓存

## effect

- 参数
  - fn
  - options
    - scheduler: 数据变化后, 不执行默认渲染, 走自己的逻辑
- 备注
  - computed、watch 都是基于 effect 实现的
  - active: 是否是响应式
  - run: 执行传入的函数
  - stop: 停止响应式

## ref

- API
  - ref
  - toRef
  - toRefs
  - proxyRefs
- 备注
  - 如果传入的是一个对象, 将会采用 react 处理

## computed

- 备注
  - 维护了一个 dirty 属性, 默认 true, 执行过一次之后, 就会变成 false
