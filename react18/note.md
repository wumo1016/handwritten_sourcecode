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
            - createWorkInProgress: 基于 oldFiber 和新属性创建一个 newFiber， 并和 oldFiber 使用 alternate 属性相互关联
              - 将 创建的 newFiber 赋给 workInProgress
            - finishQueueingConcurrentUpdates: 将 concurrentQueue 三个一组拿出来构建 hook 的 queue 的循环链表
          - workLoopSync
            - performUnitOfWork
              - beginWork: 构建 fiber 树
                - case 未决定组件：mountIndeterminateComponent (一种是函数组件，一种是类组件，但是它们都是都是函数)
                  - renderWithHooks
                    - 设置 ReactCurrentDispatcher.current 的值
                      - 首次挂载: HooksDispatcherOnMount
                        - useReducer: mountReducer
                          - mountWorkInProgressHook (创建一个新的 hook， 并将 hook 绑定到 fiber 的 memoizedState 上)
                          - dispatchReducerAction => dispatch(用户调用的时候执行)
                            - enqueueConcurrentHookUpdate
                              - enqueueUpdate: 将 fiber, queue, update 三个一组添加 concurrentQueue 中， concurrentQueuesIndex 递增
                              - getRootForUpdatedFiber: 返回根节点
                            - scheduleUpdateOnFiber: 执行重新渲染
                        - useState: mountState
                          - mountWorkInProgressHook (创建一个新的 hook， 并将 hook 绑定到 fiber 的 memoizedState 上)
                          - 在 hook 上的 queue 缓存 lastRenderedReducer、lastRenderedState
                          - dispatchSetState => dispatch(用户调用的时候执行)
                            - 执行 lastRenderedReducer 获取更新后的状态，并在此更新缓存
                            - 后面的操作同 dispatchReducerAction
                      - 更新: HooksDispatcherOnUpdate
                        - useReducer: updateReducer
                          - updateWorkInProgressHook: 创建一个新的 hook
                          - 然后遍历 hook 的 queue
                            - 看当前 update 是否有，有缓存直接取缓存
                            - 否则执行传入的 reducer，获取新状态
                            - 并更新 hook 状态，并返回
                        - useState: updateState
                          - updateReducer(baseStateReducer): 内置一个处理函数，直接走 updateReducer 逻辑
                    - 执行函数 获取子 vdom
                  - reconcileChildren: 根据 fiber 创建真实 dom
                    - 有老 fiber: reconcileChildFibers => 需要设置副作用
                    - 无老 fiber: reconcileChildFibers => 无需设置副作用
                    - reconcileChildFibers(以上两个方法走的都是)
                      - 单节点
                        - reconcileSingleElement
                          - 遍历子 fiber
                            - key 一致
                              - type 一致
                                - useFiber 复用老 fiber，并更新 props，然后直接返回当前 fiber
                              - type 不一致
                            - key 不一致，删除当前 child
                        - placeSingleChild
                  - 然后返回刚刚创建的子 fiber
                - case 根组件：updateHostRoot
                  - processUpdateQueue: 将虚拟 dom 从 updateQueue 保存到当前 fiber 的 memoizedState 上
                  - reconcileChildren
                  - 然后返回刚刚创建的子 fiber
                - case 函数组件
                  - updateFunctionComponent: 更新时走，效果同 mountIndeterminateComponent
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
                  - case 函数组件 => bubbleProperties
                  - case 原生节点组件 => bubbleProperties
                    - 新建
                      - 创建真是 dom 节点 并赋值给 fiber.stateNode
                      - appendAllChildren: 把所有儿子节点都添加到自己身上
                      - finalizeInitialChildren: 处理 dom 例如：设置 dom 属性等 (纯文本节点的文本内容就是在这添加上去的)
                    - 更新
                      - updateHostComponent
                        - prepareUpdate
                          - diffProperties => [key1, value1, key2, value2 ...] 并保存到当前 fiber 的 updateQueue 上
                        - markUpdate
                  - case 文本组件: 创建一个真实的文本节点 并赋值给 fiber.stateNode => bubbleProperties
        - commitRoot: 提交根节点

          - commitMutationEffectsOnFiber(如果自己或孩子有修改)

            - recursivelyTraverseMutationEffects: 先遍历它们的子节点，处理它们的子节点上的副作用
              - commitMutationEffectsOnFiber(递归调用)
            - commitReconciliationEffects: 再处理自己身上的副作用
              - commitPlacement: 如果当前 fiber 是新增，将自己插入到父节点中
            - 如果是原生节点 fiber
              - 有更新 && fiber 的 updateQueue 有值
                - commitUpdate
                  - updateProperties: 更新 dom 上的属性 包括 children、style，纯文本节点就是在这更新的内容
                  - updateFiberProps: 缓存属性到 dom 上

## 事件处理

- 所有的事件都委托给根容器(div.#root)处理
- jsx 中写的事件都编译在 props 中
- 有一个插件系统
- 合成事件: 绑定的事件参数是一个合成事件对象
- 过程
  - 注册事件: SimpleEventPlugin.registerEvents (ReactDOMRoot.js)
    - registerSimpleEvent(遍历 simpleEventPluginEvents => ['click'])
      - 设置原生事件名对 react 事件名的映射 topLevelEventsToReactNames<name, reactName>
      - registerTwoPhaseEvent: 注册两种事件
        - registerDirectEvent: 冒泡事件
        - registerDirectEvent: 捕获事件
  - 添加监听事件: listenToAllSupportedEvents (ReactDOMRoot.js)
    - 遍历 allNativeEvents 执行
      - listenToNativeEvent: 捕获
        - 同下
      - listenToNativeEvent: 冒泡
        - addTrappedEventListener
          - createEventListenerWrapperWithPriority => listener (创建一个监听函数)
            - dispatchDiscreteEvent
              - dispatchEvent: 事件实际触发的函数
                - dispatchEventForPluginEventSystem
                  - dispatchEventForPlugins
                    - `const dispatchQueue = []` (创建一个派发队列)
                    - extractEvents: 往派发队列中添加事件
                      - SimpleEventPlugin.extractEvents (SimpleEventPlugin.js)
                        - accumulateSinglePhaseListeners: 获取事件队列(从当前 dom 一直到顶级 dom 的绑定事件) => listeners
                        - new SyntheticEventCtor: 创建合成事件对象 => event
                        - dispatchQueue.push({ listeners, event })
                    - processDispatchQueue: 执行派发队列里的事件
                      - processDispatchQueueItemsInOrder (遍历 dispatchQueue 执行)
                        - executeDispatch
                          - 执行 listener(event) (遍历 listeners 执行)
          - case 捕获: addEventCaptureListener => 添加原生捕获事件
          - case 冒泡: addEventBubbleListener => 添加原生冒泡事件

## hooks

- useReducer
  - React.useReducer(ReactHooks.js)
    - resolveDispatcher => ReactCurrentDispatcher.current 拿到的实际就是在 renderWithHooks 中定义的 useReducer
    - useReducer => [state, setFn]
      - setFn 实际执行的就是在 renderWithHooks 中定义的 dispatchReducerAction
- useState: 是 useReducer 的一个简化(内置了 reducer)
  - React.useState(ReactHooks.js)
    - resolveDispatcher => ReactCurrentDispatcher.current 拿到的实际就是在 renderWithHooks 中定义的 useState
    - useState => [state, setFn]
      - setFn 实际执行的就是在 renderWithHooks 中定义的 dispatchReducerAction

## 多节点 diff

- 三个规则
  - 只对同级元素进行比较，不同层级不对比
  - type 不一样 就不一样
  - 通过 key 来标识同一个节点
- 三轮遍历
  - 第一轮
    - 如果 key 不同则直接结束本轮循环
    - newChildren 或 oldFiber 遍历完，结束本轮循环
    - key 相同而 type 不同，标记老的 oldFiber 为删除，继续循环
    - key 相同而 type 也相同，则可以复用老节 oldFiber 节点，继续循环
  - 第二轮
    - newChildren 遍历完而 oldFiber 还有，遍历剩下所有的 oldFiber 标记为删除，DIFF 结束
    - oldFiber 遍历完了，而 newChildren 还有，将剩下的 newChildren 标记为插入，DIFF 结束
    - newChildren 和 oldFiber 都同时遍历完成，diff 结束
    - newChildren 和 oldFiber 都没有完成，则进行节点移动的逻辑
  - 第三轮
    - 处理节点移动的情况

## 备注

- path.posix: 返回 linux 下的路径等
