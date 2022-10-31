import ReactSharedInternals from 'shared/ReactSharedInternals'
import { enqueueConcurrentHookUpdate } from './ReactFiberConcurrentUpdates'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'

const { ReactCurrentDispatcher } = ReactSharedInternals
let currentlyRenderingFiber = null
let workInProgressHook = null
let oldHook = null // 当前 hook 对应的老hook

const HooksDispatcherOnMount = {
  useReducer: mountReducer
  // useState: mountState
}
const HooksDispatcherOnUpdate = {
  useReducer: updateReducer
  // useState: updateState
}

/**
 * 渲染函数组件
 * @param {*} oldFiber 老fiber
 * @param {*} newFiber 新fiber
 * @param {*} Component 组件定义
 * @param {*} props 组件属性
 * @returns 虚拟DOM或者说React元素
 */
export function renderWithHooks(oldFiber, newFiber, Component, props) {
  currentlyRenderingFiber = newFiber // Function组件对应的fiber
  // 如果有老的fiber,并且有老的hook链表
  if (oldFiber !== null && oldFiber.memoizedState !== null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate
  } else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMount
  }
  const children = Component(props)
  currentlyRenderingFiber = null
  workInProgressHook = null
  oldHook = null
  return children
}
/**
 * @Author: wyb
 * @Descripttion: 挂载 Reducer
 * @param {*} reducer
 * @param {*} initialArg
 */
function mountReducer(reducer, initialArg) {
  // 挂载构建中的hook
  const hook = mountWorkInProgressHook()
  /* 
  hook = {
    memoizedState: initialArg,
    queue: {
      pending: {
        action, // 参数
        next // 下一个update
      },
      dispatch: dispatch
    },
    next: 指向下一个hook
  } 
  fiber.memoizedState = hook
  */
  hook.memoizedState = initialArg
  const queue = {
    pending: null,
    dispatch: null
  }
  hook.queue = queue
  const dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  )
  queue.dispatch = dispatch
  return [hook.memoizedState, dispatch]
}
/**
 * @Author: wyb
 * @Descripttion: 挂载构建中的hook
 */
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null, // hook的状态 0
    queue: null, // 存放本hook的更新队列 queue.pending=update 的循环链表
    next: null // 指向下一个hook,一个函数里可以会有多个hook,它们会组成一个单向链表
  }
  if (workInProgressHook === null) {
    // 当前函数对应的fiber的状态等于第一个hook对象
    workInProgressHook = hook
    currentlyRenderingFiber.memoizedState = hook // 将 fiber 与hook关联
  } else {
    // 构建 hook 链表
    workInProgressHook.next = hook
    workInProgressHook = hook
  }
  return hook
}
/**
 * 执行派发动作的方法，它要更新状态，并且让界面重新更新
 * @param {*} fiber function对应的fiber
 * @param {*} queue hook对应的更新队列
 * @param {*} action 派发的动作
 */
function dispatchReducerAction(fiber, queue, action) {
  // 在每个hook里会存放一个更新队列，更新队列是一个更新对象的循环链表update1.next=update2.next=update1
  const update = {
    action, // { type: 'add', payload: 1 } 派发的动作
    next: null //指向下一个更新对象
  }
  // 把当前的最新的更添的添加更新队列中，并且返回当前的根的 stateNode
  const root = enqueueConcurrentHookUpdate(fiber, queue, update)
  scheduleUpdateOnFiber(root)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} reducer
 */
function updateReducer(reducer) {
  // 获取新的hook
  const hook = updateWorkInProgressHook()
  // 获取新的hook的更新队列
  const queue = hook.queue
  // 获取将要生效的更新队列
  const pendingQueue = queue.pending
  // 初始化一个新的状态，取值为当前的状态
  let newState = oldHook.memoizedState
  if (pendingQueue !== null) {
    // 清空更新队列
    queue.pending = null
    const firstUpdate = pendingQueue.next
    let update = firstUpdate
    do {
      // if (update.hasEagerState) {
      //   newState = update.eagerState
      // } else {
      //   const action = update.action
      //   newState = reducer(newState, action)
      // }
      newState = reducer(newState, update.action)
      update = update.next
    } while (update !== null && update !== firstUpdate)
  }
  hook.memoizedState = newState
  return [hook.memoizedState, queue.dispatch]
  return []
}
/**
 * @Author: wyb
 * @Descripttion: 构建新的 hook
 */
function updateWorkInProgressHook() {
  // 获取将要构建的新的hook的老hook
  if (oldHook === null) {
    const current = currentlyRenderingFiber.alternate
    oldHook = current.memoizedState
  } else {
    oldHook = oldHook.next
  }
  //根据老hook创建新hook
  const newHook = {
    memoizedState: oldHook.memoizedState,
    queue: oldHook.queue,
    next: null
  }
  // 构建新的hook链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook
  } else {
    workInProgressHook = workInProgressHook.next = newHook
  }
  return workInProgressHook
}

//useState其实就是一个内置了reducer的useReducer
function baseStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action
}
function updateState() {
  return updateReducer(baseStateReducer)
}
function mountState(initialState) {
  const hook = mountWorkInProgressHook()
  hook.memoizedState = initialState
  const queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: baseStateReducer, //上一个reducer
    lastRenderedState: initialState //上一个state
  }
  hook.queue = queue
  const dispatch = (queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue
  ))
  return [hook.memoizedState, dispatch]
}
function dispatchSetState(fiber, queue, action) {
  const update = {
    action,
    hasEagerState: false, //是否有急切的更新
    eagerState: null, //急切的更新状态
    next: null
  }
  // 当你派发动作后，我立刻用上一次的状态和上一次的reducer计算新状态
  const { lastRenderedReducer, lastRenderedState } = queue
  const eagerState = lastRenderedReducer(lastRenderedState, action)
  update.hasEagerState = true
  update.eagerState = eagerState
  if (Object.is(eagerState, lastRenderedState)) {
    return
  }
  // 下面是真正的入队更新，并调度更新逻辑
  const root = enqueueConcurrentHookUpdate(fiber, queue, update)
  scheduleUpdateOnFiber(root)
}
