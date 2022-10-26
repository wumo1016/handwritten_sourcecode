## jsx

- 浏览器请求 jsx 运行时 会被 babel 进行转义
- 先对 jsx 进行处理

## fiber

- 原因
  - js 执行的时间过长；浏览器刷新频率为 60Hz,大概 16.6 毫秒渲染一次，而 JS 线程和渲染线程是互斥的，所以如果 JS 线程执行任务时间超过 16.6ms 的话，就会导致掉帧，导致卡顿，解决方案就是 React 利用空闲的时间进行更新，不影响渲染进行的渲染
  - 所以把一个耗时任务切分成一个个小任务，分布在每一帧里的方式就叫时间切片
  - react17 之前，虚拟 DOM => 真实 DOM 一气呵成，中间无法中断 (1.react/doc/6.render.html)
  - 之后，虚拟 DOM => fiber => 真实 DOM，因为 fiber 是一个链表，方便中断和重启
- requestIdleCallback
  - 正常帧任务完成后没超过 16 ms,说明时间有富余，此时就会执行 requestIdleCallback 里注册的任务
  - 未使用这个方法，因为兼容性问题和执行时间不可控，所以自己实现了一个类似的，把执行的时间定位 5ms
- 实现原理

  - 将多个大任务拆分成小任务
  - Fiber 是一个执行单元,每次执行完一个执行单元, React 就会检查现在还剩多少时间，如果没有时间就将控制权让出去
  - Fiber 是一种数据结构
    - React 目前的做法是使用链表, 每个虚拟节点内部表示为一个 Fiber

- FiberRootNode
  - containerInfo => div#root
  - current => FiberNode
    - stateNode => FiberRootNode

## 过程

- 创建根 fiber
- 初始化更新队列 (设置 fiber 的 udpateQueue)
- 开始渲染 走根节点的 render 方法
- 构建 fiber 树

## 备注

- path.posix: 返回 linux 下的路径等