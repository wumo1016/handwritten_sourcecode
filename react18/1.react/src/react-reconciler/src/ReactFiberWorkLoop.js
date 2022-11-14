import {
  scheduleCallback as Scheduler_scheduleCallback,
  ImmediatePriority as ImmediateSchedulerPriority,
  UserBlockingPriority as UserBlockingSchedulerPriority,
  NormalPriority as NormalSchedulerPriority,
  IdlePriority as IdleSchedulerPriority,
  shouldYield,
  cancelCallback as Scheduler_cancelCallback,
  now
} from './scheduler'
import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import { completeWork } from './ReactFiberCompleteWork'
import {
  NoFlags,
  MutationMask,
  Placement,
  Update,
  ChildDeletion,
  Passive
} from './ReactFiberFlags'
import {
  commitLayoutEffects,
  commitMutationEffectsOnFiber,
  commitPassiveMountEffects,
  commitPassiveUnmountEffects
} from './ReactFiberCommitWork'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText
} from './ReactWorkTags'
import { finishQueueingConcurrentUpdates } from './ReactFiberConcurrentUpdates'
import {
  NoLanes,
  markRootUpdated,
  getNextLanes,
  getHighestPriorityLane,
  SyncLane,
  includesBlockingLane,
  NoLane,
  NoTimestamp,
  markStarvedLanesAsExpired,
  includesExpiredLane,
  mergeLanes,
  markRootFinished
} from './ReactFiberLane'
import {
  getCurrentUpdatePriority,
  lanesToEventPriority,
  DiscreteEventPriority,
  ContinuousEventPriority,
  DefaultEventPriority,
  IdleEventPriority,
  setCurrentUpdatePriority
} from './ReactEventPriorities'
import { getCurrentEventPriority } from 'react-dom-bindings/src/client/ReactDOMHostConfig'
import {
  flushSyncCallbacks,
  scheduleSyncCallback
} from './ReactFiberSyncTaskQueue'

// 正在进行的工作 当前 fiber 防止同步修改多次渲染
let workInProgress = null
let workInProgressRoot = null
let rootDoesHavePassiveEffect = false // 此根节点上有没有useEffect类似的副作用
let rootWithPendingPassiveEffects = null // 具有useEffect副作用的根节点 FiberRootNode,根fiber.stateNode
let workInProgressRootRenderLanes = NoLanes // 当前正在进行的渲染优先级

// 构建fiber树正在进行中
const RootInProgress = 0
// 构建fiber树已经完成
const RootCompleted = 5
// 当渲染工作结束的时候当前的fiber树处于什么状态,默认进行中
let workInProgressRootExitStatus = RootInProgress
// 保存当前的事件发生的时间
let currentEventTime = NoTimestamp

/**
 * @Author: wyb
 * @Descripttion: 计划更新root 源码中此处有一个任务的功能
 * @param {*} root
 * @param {*} fiber
 * @param {*} lane
 */
export function scheduleUpdateOnFiber(root, fiber, lane, eventTime) {
  // 标记根赛道
  root.pendingLanes = 16
  markRootUpdated(root, lane)
  // 确保调度执行root上的更新
  ensureRootIsScheduled(root, eventTime)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 */
function ensureRootIsScheduled(root, currentTime) {
  // 先获取当前根上执行任务
  const existingCallbackNode = root.callbackNode
  // 把所有饿死的赛道标记为过期
  markStarvedLanesAsExpired(root, currentTime)
  // 获取当前优先级最高的车道
  const nextLanes = getNextLanes(root, workInProgressRootRenderLanes)
  // 如果没有要执行的任务
  if (nextLanes === NoLanes) {
    return
  }
  // 如果已存在任务 先取消 (高优操作打断低优操作)
  if (existingCallbackNode !== null) {
    console.log('cancelCallback')
    Scheduler_cancelCallback(existingCallbackNode)
  }
  // 新的回调任务
  let newCallbackNode = null
  // 获取新的调度优先级
  const newCallbackPriority = getHighestPriorityLane(nextLanes)
  // 获取现在根上正在运行的优先级
  const existingCallbackPriority = root.callbackPriority
  // 如果新的优先级和老的优先级一样，则可以进行批量更新
  if (existingCallbackPriority === newCallbackPriority) {
    return
  }
  // 如果是同步(事件等)
  // 新的回调任务
  if (newCallbackPriority === SyncLane) {
    // 先把performSyncWorkOnRoot添回到同步队列中
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))
    // 将执行同步队列方法 放入微任务中
    queueMicrotask(flushSyncCallbacks)
    // 如果是同步执行的话
    newCallbackNode = null
  } else {
    // 如果不是同步，就需要调度一个新的任务
    // 将lane转换为 SchedulerPriority => 调度优先级
    let schedulerPriorityLevel
    switch (lanesToEventPriority(nextLanes)) {
      case DiscreteEventPriority:
        schedulerPriorityLevel = ImmediateSchedulerPriority
        break
      case ContinuousEventPriority:
        schedulerPriorityLevel = UserBlockingSchedulerPriority
        break
      case DefaultEventPriority:
        schedulerPriorityLevel = NormalSchedulerPriority
        break
      case IdleEventPriority:
        schedulerPriorityLevel = IdleSchedulerPriority
        break
      default:
        schedulerPriorityLevel = NormalSchedulerPriority
        break
    }
    // 返回一个任务
    newCallbackNode = Scheduler_scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root)
    )
  }
  // 在根节点的执行的任务是newCallbackNode
  root.callbackNode = newCallbackNode
  root.callbackPriority = newCallbackPriority
}
/**
 * @Author: wyb
 * @Descripttion: 在根上执行同步工作
 * @param {*} root
 */
function performSyncWorkOnRoot(root) {
  // 获得最高优的lane
  const lanes = getNextLanes(root)
  // 渲染新的fiber树
  renderRootSync(root, lanes)
  // 获取新渲染完成的fiber根节点
  const newRootFiber = root.current.alternate
  root.finishedWork = newRootFiber
  commitRoot(root)
  return null
}
/**
 * @Author: wyb
 * @Descripttion: 在根上执行异步工作 根据fiber构建fiber树 => 要创建真实的DOM节点 => 还需要把真实的DOM节点插入容器
 * @param {*} root
 */
function performConcurrentWorkOnRoot(root, didTimeout) {
  // 先获取当前根节点上的任务
  const originalCallbackNode = root.callbackNode
  // 获取当前优先级最高的车道
  const lanes = getNextLanes(root, NoLanes) //16
  if (lanes === NoLanes) {
    return null
  }
  // 如果不包含阻塞的车道，并且没有超时，就可以并行渲染,就是启用时间分片
  // 所以说默认更新车道是同步的,不能启用时间分片
  // const shouldTimeSlice = !includesBlockingLane(root, lanes) && !didTimeout

  // 是否不包含阻塞车道
  const nonIncludesBlockingLane = !includesBlockingLane(root, lanes)
  // 是否不包含过期的车道
  const nonIncludesExpiredLane = !includesExpiredLane(root, lanes)
  // 时间片没有过期
  const nonTimeout = !didTimeout
  // 是否进行并发渲染
  const shouldTimeSlice =
    nonIncludesBlockingLane && nonIncludesExpiredLane && nonTimeout
  // 执行渲染，得到退出的状态
  const exitStatus = shouldTimeSlice
    ? renderRootConcurrent(root, lanes)
    : renderRootSync(root, lanes)
  // 如果不是渲染中 说明已经渲染完了
  if (exitStatus !== RootInProgress) {
    // 开始进入提交 阶段，就是执行副作用，修改真实DOM
    const newRootFiber = root.current.alternate
    root.finishedWork = newRootFiber
    // 提交根节点
    commitRoot(root)
  }
  // 说明任务没有完成
  if (root.callbackNode === originalCallbackNode) {
    // 把此函数返回，下次接着干
    return performConcurrentWorkOnRoot.bind(null, root)
  }
  return null
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 * @param {*} lanes
 */
function renderRootConcurrent(root, lanes) {
  // 因为在构建fiber树的过程中，此方法会反复进入，会进入多次
  // 只有在第一次进来的时候会创建新的fiber树，或者说新fiber
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
    prepareFreshStack(root, lanes)
  }
  // 在当前分配的时间片(5ms)内执行fiber树的构建或者说渲染，
  workLoopConcurrent()
  // 如果 workInProgress不为null，说明fiber树的构建还没有完成
  if (workInProgress !== null) {
    return RootInProgress
  }
  //如果workInProgress是null了说明渲染工作完全结束了
  return workInProgressRootExitStatus
}
/**
 * @Author: wyb
 * @Descripttion:
 */
function workLoopConcurrent() {
  // 如果有下一个要构建的fiber并且时间片没有过期
  while (workInProgress !== null && !shouldYield()) {
    sleep(5) // 每个fiber多执行一会
    performUnitOfWork(workInProgress)
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 */
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}
/**
 * @Author: wyb
 * @Descripttion: 第一次渲染以同步的方式渲染根节点，初次渲染的时候，都是同步
 * @param {*} root
 */
function renderRootSync(root, renderLanes) {
  // 如果新的根和老的根不一样，或者新的渲染优先级和老的渲染优先级不一样
  if (
    root !== workInProgressRoot ||
    workInProgressRootRenderLanes !== renderLanes
  ) {
    // 准备一个新的栈 根fiber
    prepareFreshStack(root, renderLanes)
  }
  // 同步递归构建 fiber 树
  workLoopSync()
  return RootCompleted
}
/**
 * @Author: wyb
 * @Descripttion: 构建 fiber 树
 * @param {*} root
 */
function prepareFreshStack(root, renderLanes) {
  workInProgress = createWorkInProgress(root.current, null)
  workInProgressRootRenderLanes = renderLanes
  workInProgressRoot = root
  finishQueueingConcurrentUpdates()
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} curFiber
 */
function performUnitOfWork(curFiber) {
  // 获取老fiber
  const oldFiber = curFiber.alternate
  // 完成当前fiber的子fiber链表构建后
  const next = beginWork(oldFiber, curFiber, workInProgressRootRenderLanes)
  curFiber.memoizedProps = curFiber.pendingProps
  if (next === null) {
    // 如果没有子节点表示当前的fiber已经完成了
    completeUnitOfWork(curFiber)
  } else {
    // 如果有子节点，就让子节点成为下一个工作单元
    workInProgress = next
  }
}
/**
 * @Author: wyb
 * @Descripttion: 完成一个工作单元(fiber)
 * @param {*} unitOfWork
 */
function completeUnitOfWork(unitOfWork) {
  let curFiber = unitOfWork
  do {
    const oldFiber = curFiber.alternate
    const returnFiber = curFiber.return
    // 执行此fiber 的完成工作,如果是原生组件的话就是创建真实的DOM节点
    completeWork(oldFiber, curFiber)
    // 如果有弟弟，就构建弟弟对应的fiber子链表
    const siblingFiber = curFiber.sibling
    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }
    // 如果没有弟弟，说明这当前完成的就是父fiber的最后一个节点
    // 也就是说一个父fiber,所有的子fiber全部完成了
    curFiber = returnFiber
    workInProgress = curFiber
  } while (curFiber !== null)
  // 如果走到了这里，说明整个fiber树全部构建完毕,把构建状态设置为空成
  if (workInProgressRootExitStatus === RootInProgress) {
    workInProgressRootExitStatus = RootCompleted
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 */
function commitRoot(root) {
  const previousUpdatePriority = getCurrentUpdatePriority()
  try {
    // 把当前的更新优先级设置为1
    setCurrentUpdatePriority(DiscreteEventPriority)
    commitRootImpl(root)
  } finally {
    setCurrentUpdatePriority(previousUpdatePriority)
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 */
function commitRootImpl(root) {
  const { finishedWork } = root
  // 清空
  workInProgressRoot = null
  workInProgressRootRenderLanes = NoLanes
  root.callbackNode = null
  root.callbackPriority = NoLane
  // 合并统计当前新的根上剩下的车道
  const remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes)
  markRootFinished(root, remainingLanes)
  // 自己或子有延迟副作用
  if (
    (finishedWork.subtreeFlags & Passive) !== NoFlags ||
    (finishedWork.flags & Passive) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffect) {
      rootDoesHavePassiveEffect = true
      Scheduler_scheduleCallback(NormalSchedulerPriority, flushPassiveEffect)
    }
  }
  // printFinishedWork(finishedWork)
  // 判断子树有没有副作用 就是有没有新增或修改
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  // 根是否有副作用
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags
  // 如果自己的副作用或者子节点有副作用就进行提交DOM操作
  if (subtreeHasEffects || rootHasEffect) {
    // 执行 fiber 的副作用
    commitMutationEffectsOnFiber(finishedWork, root)
    // console.log(
    //   'DOM执行变更后commitLayoutEffects~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    // )
    // 执行layout Effect
    commitLayoutEffects(finishedWork, root)
    if (rootDoesHavePassiveEffect) {
      rootDoesHavePassiveEffect = false
      rootWithPendingPassiveEffects = root
    }
  }
  // 等DOM变更后，就可以把让root的current指向新的fiber树
  root.current = finishedWork
  // 在提交之后，因为根上可能会有跳过的更新，所以需要重新再次调度
  ensureRootIsScheduled(root, now())
}
/**
 * @Author: wyb
 * @Descripttion:
 */
function flushPassiveEffect() {
  // console.log('下一个宏任务中flushPassiveEffect~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  if (rootWithPendingPassiveEffects !== null) {
    const root = rootWithPendingPassiveEffects
    // 执行卸载副作用，destroy
    commitPassiveUnmountEffects(root.current)
    // 执行挂载副作用 create
    commitPassiveMountEffects(root, root.current)
  }
}
/**
 * @Author: wyb
 * @Descripttion: 打印完成工作的副作用
 * @param {*} fiber
 */
function printFinishedWork(fiber) {
  const { flags, deletions } = fiber
  if ((flags & ChildDeletion) !== NoFlags) {
    fiber.flags &= ~ChildDeletion
    console.log(
      '子节点有删除' +
        deletions.map((fiber) => `${fiber.type}#${fiber.key}`).join(',')
    )
  }
  let child = fiber.child
  while (child) {
    printFinishedWork(child)
    child = child.sibling
  }

  if (fiber.flags !== NoFlags) {
    console.log(
      getFlags(fiber),
      getTag(fiber.tag),
      typeof fiber.type === 'function' ? fiber.type.name : fiber.type,
      fiber.memoizedProps
    )
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} flags
 */
function getFlags(fiber) {
  const { flags, deletions } = fiber
  if (flags === (Placement | Update)) {
    return '移动'
  }
  if (flags === Placement) {
    return '插入'
  }
  if (flags === Update) {
    return '更新'
  }
  return flags
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} tag
 */
function getTag(tag) {
  switch (tag) {
    case HostRoot:
      return 'HostRoot'
    case FunctionComponent:
      return 'FunctionComponent'
    case HostComponent:
      return 'HostComponent'
    case HostText:
      return 'HostText'
    default:
      return tag
  }
}
/**
 * @Author: wyb
 * @Descripttion: 请求一个更新优先级
 */
export function requestUpdateLane() {
  const updateLane = getCurrentUpdatePriority()
  if (updateLane !== NoLanes) {
    return updateLane
  }
  const eventLane = getCurrentEventPriority()
  return eventLane
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} duration
 */
function sleep(duration) {
  const timeStamp = new Date().getTime()
  const endTime = timeStamp + duration
  while (true) {
    if (new Date().getTime() > endTime) {
      return
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion: 请求当前的时间
 */
export function requestEventTime() {
  currentEventTime = now()
  return currentEventTime // performance.now()
}
