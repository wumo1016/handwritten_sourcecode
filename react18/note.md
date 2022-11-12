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

  - requestUpdateLane: 获取一个更新车道
    - getCurrentUpdatePriority: 获取当前更新车道 currentUpdatePriority(ReactEventPriorities.js)
    - 如果 currentUpdatePriority 为 NoLane，就是没有
      - getCurrentEventPriority: 获取当前事件车道
        - 如果没有就返回 DefaultEventPriority(默认事件车道)
        - 如果有事件，事件类习惯 => 事件优先级 => 对应的车道
  - createUpdate: 创建一个对象 { tag, lane, next }
  - enqueueUpdate: 返回根节点 FiberRootNode
    - enqueueConcurrentClassUpdate
      - enqueueUpdate: 将 `fiber, fiber.updateQueue.shared(queue), update,lane` 添加进 concurrentQueues 中
  - scheduleUpdateOnFiber

    - markRootUpdated: 标记根节点的更新车道 root.pendingLanes |= lane
    - ensureRootIsScheduled

      - getNextLanes: 获取当前优先级最高的车道
      - getHighestPriorityLane: 根据优先级最高的车道获取新的调度车道
      - 是否是同步车道

        - 是
          - scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))
            - scheduleSyncCallback: 将同步回调添加进同步队列
            - : 在根上执行同步工作(在 flushSyncCallbacks 的时候执行)
            - getNextLanes: 获得最高优的 lane
            - renderRootSync: 同下
            - commitRoot: 同下
            - return null
          - queueMicrotask(flushSyncCallbacks): 将执行同步队列方法 放入微任务中
            - flushSyncCallbacks: 执行同步队列 syncQueue 中的回调
        - 否

          - 根据调用车道获取调度优先级
          - scheduleCallback(performConcurrentWorkOnRoot): scheduleCallback 为调度器 空闲的时候执行 performConcurrentWorkOnRoot
          - performConcurrentWorkOnRoot: 真正执行的函数，构建 fiber 树，渲染等等

            - getNextLanes: 获取当前优先级最好的车道，如果没有，就直接返回，不再往下执行
            - includesBlockingLane: 是否使用时间切片

              - 是
                - renderRootConcurrent
                  - prepareFreshStack: 同下
                  - workLoopConcurrent
                    - performUnitOfWork: 如果 workInProgress 不为 null 且 本次任务执行时间没有超期(执行时间没有超过 5s)就一直执行
                  - 返回 workInProgressRootExitStatus
              - 否

                - renderRootSync: 第一次从根部同步渲染

                  - prepareFreshStack
                    - createWorkInProgress: 基于 oldFiber 和新属性创建一个 newFiber， 并和 oldFiber 使用 alternate 属性相互关联
                      - 将 创建的 newFiber 赋给 workInProgress
                    - finishQueueingConcurrentUpdates: 将 concurrentQueue 三个一组拿出来构建 hook 的 queue 的循环链表
                  - workLoopSync

                    - performUnitOfWork: 如果 workInProgress 不为 null 就一直执行

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
                                - useEffect: mountEffect
                                  - mountEffectImpl
                                    - mountWorkInProgressHook (创建一个新的 hook， 并将 hook 绑定到 fiber 的 memoizedState 上)
                                    - pushEffect => 创建 effect 赋值给 hook.memoizedState
                                      - 创建一个 effect
                                      - 构建 effect 循环链表，指向 fiber.updateQueue.lastEffect
                                - useLayoutEffect: mountLayoutEffect
                                  - 执行 mountEffect 中的 mountEffectImpl
                              - 更新: HooksDispatcherOnUpdate
                                - useReducer: updateReducer
                                  - updateWorkInProgressHook: 创建一个新的 hook
                                  - 然后遍历 hook 的 queue
                                    - 看当前 update 是否有，有缓存直接取缓存
                                    - 否则执行传入的 reducer，获取新状态
                                    - 并更新 hook 状态，并返回
                                - useState: updateState
                                  - updateReducer(baseStateReducer): 内置一个处理函数，直接走 updateReducer 逻辑
                                - useEffect: updateEffect
                                  - updateEffectImpl
                                    - updateWorkInProgressHook
                                      - 对比新旧依赖，都执行 pushEffect(有且新旧依赖都一样就不添加副作用)
                                - useLayoutEffect: updateLayoutEffect
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
                                        - deleteRemainingChildren 删除包括当前 fiber 后面的所有 fiber
                                          - 遍历当前 fiber 以及后面的兄弟 fiber，执行 deleteChild
                                            - 将当前 fiber 添加到 parentFiber.deletions 中去
                                        - createFiberFromElement 创建新 fiber 并返回
                                    - key 不一致
                                      - 删除当前 child
                                      - 继续下一个子 fiber，走对比过程
                                      - 如果最后都没有找到，就直接 createFiberFromElement 创建新 fiber 并返回
                                - placeSingleChild
                              - 多节点
                                - reconcileChildrenArray
                                  - 第一次循环: 遍历老虚拟 dom(索引小于总长度 && 有老 fiber)
                                    - updateSlot: 试图复用 oldFiber(key 一样)，如果没有直接跳出循环，继续向下执行
                                    - 如果是新创建的(key 一样，type 不一样)
                                      - deleteChild: 删除老 fiber
                                  - 如果新虚拟 dom 已经循环完毕且 oldFiber 还有值
                                    - deleteRemainingChildren: 删除剩余的老 fiber，然后`直接返回`
                                  - 第二次循环: 遍历新虚拟 dom(如果没有老 fiber && 索引小于总长度)
                                    - createChild: 都是新增的 fiber
                                  - 剩下的情况就是，老 fiber 有值 且 新虚拟 dom 还有，先将老 fiber 的 key 和值做一个 map 映射
                                  - 第三次循环: 遍历新虚拟 dom(索引小于总长度)
                                    - updateFromMap: 根据 map 进行更新，有就复用(并在 map 中删除)，没有就新建
                                  - deleteChild: 遍历 map 执行，删除剩余的老 fiber

                          - 然后返回刚刚创建的子 fiber(索引小于总长度 && 有老 fiber)

                        - case 根组件: updateHostRoot
                          - cloneUpdateQueue: 将老 fiber 上的 updateQueue 克隆到新 fiber 的 updateQueue 上
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

                  - 返回 RootCompleted

            - 如果渲染完毕

              - commitRoot: 提交根节点

                - commitRootImpl

                  - scheduleCallback(flushPassiveEffect) => 开启一个新的宏任务
                    - commitPassiveUnmountEffects: 执行卸载 effect
                      - commitPassiveUnmountOnFiber
                        - recursivelyTraversePassiveUnmountEffects: 子节点递归执行 commitPassiveUnmountOnFiber
                        - commitHookPassiveUnmountEffects
                          - commitHookEffectListUnmount: 遍历 fiber.updateQueue.lastEffect 循环链表，执行 destroy 方法
                    - commitPassiveMountEffects: 执行挂载 effect
                      - commitPassiveMountOnFiber
                        - recursivelyTraversePassiveMountEffects: 子节点递归执行 commitPassiveMountOnFiber
                        - commitHookPassiveMountEffects
                          - commitHookEffectListMount: 遍历 fiber.updateQueue.lastEffect 循环链表，执行 create 方法并赋值给 fiber.destroy
                  - commitMutationEffectsOnFiber(如果自己或孩子有修改)

                    - recursivelyTraverseMutationEffects: 先遍历它们的子节点，处理它们的子节点上的副作用
                      - 先查看当前 fiber 是否有 deletions
                        - 如果有，遍历执行 commitDeletionEffects
                          - 先找到当前 fiber 的真实父 dom
                          - commitDeletionEffectsOnFiber
                            - 递归调用 recursivelyTraverseMutationEffects (因为要先删除子节点，处理生命周期等)
                            - removeChild
                      - commitMutationEffectsOnFiber(递归调用)
                    - commitReconciliationEffects: 再处理自己身上的副作用
                      - commitPlacement: 如果当前 fiber 是新增，将自己插入到父节点中
                    - 如果是原生节点 fiber
                      - 有更新 && fiber 的 updateQueue 有值
                        - commitUpdate
                          - updateProperties: 更新 dom 上的属性 包括 children、style，纯文本节点就是在这更新的内容
                          - updateFiberProps: 缓存属性到 dom 上
                    - 如果是函数组件
                      - commitHookEffectListUnmount
                        - 遍历 fiber.updateQueue.lastEffect 循环链表，执行 destroy 方法

                  - commitLayoutEffects(如果自己或孩子有修改)
                    - commitLayoutEffects
                      - commitLayoutEffectOnFiber
                        - recursivelyTraverseLayoutEffects: 子节点递归调用 commitLayoutEffectOnFiber
                        - commitHookLayoutEffects
                          - commitHookEffectListMount: 遍历 fiber.updateQueue.lastEffect 循环链表，执行 create 方法并赋值给 fiber.destroy

            - 如果任务未完成，继续执行 performConcurrentWorkOnRoot

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
- useEffect
  - 介绍
    - 参数
      - 第一个: 一个函数(返回一个函数)
      - 第二个(可选): 依赖数组(对比差异，如果一样，则不会重新执行)
    - 作用
      - DOM 操作，调用接口等
  - 实现
    - React.useEffect(ReactHooks.js)
      - resolveDispatcher => ReactCurrentDispatcher.current 拿到的实际就是在 renderWithHooks 中定义的 useEffect
- useLayoutEffect
  - 介绍
    - 与 useEffect 基本一致
    - 不同的是，useLayoutEffect 会在所有 DOM 变更之后立即调用 effect
    - useEffect 不会阻塞浏览器渲染，而 useLayoutEffect 会
    - useEffect 类似一个宏任务，useLayoutEffect 在 DOM 变更后同步执行
  - 实现
    - React.useLayoutEffect(ReactHooks.js)
      - resolveDispatcher => ReactCurrentDispatcher.current 拿到的实际就是在 renderWithHooks 中定义的 useLayoutEffect

## updateQueue

- 根 fiber
  ```js
  {
    shared: {
      pending: null
    }
  }
  ```
- 原生组件 fiber
  ```js
  ;[prop1, value1, prop2, value2] // 属性更新
  ```
- 函数组件 fiber
  ```js
  {
    lastEffect: null // 保存的 effect 链表
  }
  ```

## memoizedState

- fiber
  - 保存的 hook 对象，构建 hook 链表
- hook
  - useReducer/useState: 当前 hook 的状态值
  - useEffect: 当前 effect 对象
  ```js
  {
    tag,
    create,
    destroy,
    deps,
    next: null
  }
  ```

## scheduleCallback

- 由于 requestIdleCallback 只有 chrome 支持
- 优先使用 MessageChannel，如果没有就使用 setTimeout

## 优先级

- 车道优先级
- 事件优先级
  - 有车道优先级转换
- scheduler 优先级(Priority)

## 备注

- path.posix: 返回 linux 下的路径等
