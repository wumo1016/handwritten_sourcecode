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
  - 每个 fiber 都有自己独特的更细你队列

- FiberRootNode(真实 dom)
  - containerInfo => div#root
  - current => RootFiber
    - stateNode => FiberRootNode

## render

- render => (ReactDOMRoot.js)
- updateContainer(vdom, container) => (ReactFiberReconciler.js)

  - createUpdate: 创建一个对象 { payload: { element: vdom } }
  - enqueueUpdate: 返回根节点 FiberRootNode
    - 设置当前 fiber 的 updateQueue
    - markUpdateLaneFromFiberToRoot: 找到 FiberRootNode 并返回
  - scheduleUpdateOnFiber

    - ensureRootIsScheduled

      - scheduleCallback(performConcurrentWorkOnRoot): scheduleCallback 为调度器 空闲的时候执行 performConcurrentWorkOnRoot
      - performConcurrentWorkOnRoot: 真正执行的函数，构建 fiber 树，渲染等等

        - renderRootSync: 第一次从根部同步渲染
          - prepareFreshStack
            - createWorkInProgress: 基于 oldFiber 和新属性创建一个 newFiber 和 oldFiber 使用 alternate 属性相互关联
            - 将 创建的 newFiber 赋给 workInProgress
          - workLoopSync
            - performUnitOfWork
              - beginWork: 构建 fiber 树
                - case 未决定组件：mountIndeterminateComponent (一种是函数组件，一种是类组件，但是它们都是都是函数)
                  - renderWithHooks
                  - reconcileChildren
                  - 然后返回刚刚创建的子 fiber
                - case 根组件：updateHostRoot
                  - processUpdateQueue: 将虚拟 dom 从 updateQueue 保存到当前 fiber 的 memoizedState 上
                  - reconcileChildren
                    - 根据子 vdom 创建子 fiber 然后赋值给 父 fiber.child
                    - 子 fiber 的 props 就是 vdom 的 props
                    - 如果当前只有一个文本子节点 则不创建子 fiber
                  - 然后返回刚刚创建的子 fiber
                - case 原生节点组件: updateHostComponent
                  - reconcileChildren
                  - 然后返回刚刚创建的子 fiber
                - case 文本组件: 返回 null
                - 返回当前 fiber 的子 fiber
                  - 有值 继续走 completeUnitOfWork
                  - 为 null 就走下面的 completeUnitOfWork
              - completeUnitOfWork: 根据 fiber 创建节点 并添加
                - completeWork
                  - case 根组件 => bubbleProperties
                  - case 原生节点组件 => bubbleProperties
                    - 创建真是 dom 节点 并赋值给 fiber.stateNode
                    - appendAllChildren: 把所有儿子节点都添加到自己身上
                    - finalizeInitialChildren: 处理 dom 例如：设置 dom 属性等 (纯文本节点的文本内容就是在这添加上去的)
                  - case 文本组件: 创建一个真实的文本节点 并赋值给 fiber.stateNode => bubbleProperties
        - commitRoot: 提交根节点

          - commitMutationEffectsOnFiber(如果自己或孩子有修改)

            - recursivelyTraverseMutationEffects: 先遍历它们的子节点，处理它们的子节点上的副作用
              - commitMutationEffectsOnFiber(递归调用)
            - commitReconciliationEffects: 再处理自己身上的副作用
              - commitPlacement: 如果当前 fiber 是新增，将自己插入到父节点中
            - 如果是原生节点 fiber

## 事件处理

- 所有的事件都委托给根容器(div.#root)处理
- jsx 中写的事件都编译在 props 中
- 有一个插件系统

## 备注

- path.posix: 返回 linux 下的路径等
