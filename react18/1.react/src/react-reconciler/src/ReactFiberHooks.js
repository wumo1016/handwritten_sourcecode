import ReactSharedInternals from 'shared/ReactSharedInternals'
import { enqueueConcurrentHookUpdate } from './ReactFiberConcurrentUpdates'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import {
  Passive as PassiveEffect,
  Update as UpdateEffect
} from './ReactFiberFlags'
import {
  Passive as HookPassive,
  HasEffect as HookHasEffect,
  Layout as HookLayout
} from './ReactHookEffectTags'

const { ReactCurrentDispatcher } = ReactSharedInternals
let currentlyRenderingFiber = null
let workInProgressHook = null
let oldHook = null // 当前 hook 对应的老hook

const HooksDispatcherOnMount = {
  useReducer: mountReducer,
  useState: mountState,
  useEffect: mountEffect
}
const HooksDispatcherOnUpdate = {
  useReducer: updateReducer,
  useState: updateState,
  useEffect: updateEffect
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
  newFiber.updateQueue = null
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
      // 如果已经计算过 直接取值
      if (update.hasEagerState) {
        newState = update.eagerState
      } else {
        const action = update.action
        newState = reducer(newState, action)
      }
      update = update.next
    } while (update !== null && update !== firstUpdate)
  }
  hook.memoizedState = newState
  if (queue.lastRenderedState !== undefined) {
    queue.lastRenderedState = newState
  }
  return [hook.memoizedState, queue.dispatch]
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
  return newHook
}
/**
 * @Author: wyb
 * @Descripttion: 初次挂载 useState hook
 * @param {*} initialState
 */
function mountState(initialState) {
  const hook = mountWorkInProgressHook()
  hook.memoizedState = initialState
  const queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: baseStateReducer, // 上一个reducer
    lastRenderedState: initialState // 上一个state
  }
  hook.queue = queue
  const dispatch = (queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue
  ))
  return [hook.memoizedState, dispatch]
}
/**
 * @Author: wyb
 * @Descripttion: 内置的useState的reducer函数
 * @param {*} state
 * @param {*} action
 */
function baseStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fiber
 * @param {*} queue
 * @param {*} action
 */
function dispatchSetState(fiber, queue, action) {
  const update = {
    action,
    hasEagerState: false, // 是否计算过
    eagerState: null, // 计算过的状态
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
/**
 * @Author: wyb
 * @Descripttion: 更新时 hook 的方法
 */
function updateState() {
  return updateReducer(baseStateReducer)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} create
 * @param {*} deps
 */
function mountEffect(create, deps) {
  return mountEffectImpl(PassiveEffect, HookPassive, create, deps)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fiberFlags
 * @param {*} hookFlags
 * @param {*} create
 * @param {*} deps
 */
function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
  const hook = mountWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps
  // 给当前的函数组件fiber添加flags
  currentlyRenderingFiber.flags |= fiberFlags
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps
  )
}
/**
 * @Author: wyb
 * @Descripttion: 构建effect链表
 * @param {*} tag
 * @param {*} create 创建方法
 * @param {*} destroy 销毁方法
 * @param {*} deps 依赖数组
 */
function pushEffect(tag, create, destroy, deps) {
  const effect = {
    tag,
    create,
    destroy,
    deps,
    next: null
  }
  let componentUpdateQueue = currentlyRenderingFiber.updateQueue
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue()
    currentlyRenderingFiber.updateQueue = componentUpdateQueue
    componentUpdateQueue.lastEffect = effect.next = effect
  } else {
    const lastEffect = componentUpdateQueue.lastEffect
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect
    } else {
      // 构建循环链表
      const firstEffect = lastEffect.next
      lastEffect.next = effect
      effect.next = firstEffect
      componentUpdateQueue.lastEffect = effect
    }
  }
  return effect
}
/**
 * @Author: wyb
 * @Descripttion: 初始化函数组件的updateQueue
 */
function createFunctionComponentUpdateQueue() {
  return {
    lastEffect: null
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} create
 * @param {*} deps
 */
function updateEffect(create, deps) {
  return updateEffectImpl(PassiveEffect, HookPassive, create, deps)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fiberFlags
 * @param {*} hookFlags
 * @param {*} create
 * @param {*} deps
 */
function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  const hook = updateWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps
  let destroy
  // 上一个老hook
  if (oldHook !== null) {
    // 获取此useEffect这个Hook上老的effect对象 create deps destroy
    const prevEffect = oldHook.memoizedState
    destroy = prevEffect.destroy
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps
      // 用新数组和老数组进行对比，如果一样的话
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 不管要不要重新执行，都需要把新的effect组成完整的循环链表放到 fiber.updateQueue 中
        // 必须有 HookHasEffect 才会执行
        hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps)
        return
      }
    }
  }
  // 如果要执行的话需要修改fiber的flags
  currentlyRenderingFiber.flags |= fiberFlags
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,
    nextDeps
  )
}
/**
 * @Author: wyb
 * @Descripttion: 对比新旧依赖
 * @param {*} nextDeps
 * @param {*} prevDeps
 */
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) return null
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue
    }
    return false
  }
  return true
}
