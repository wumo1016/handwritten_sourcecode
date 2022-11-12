import {
  scheduleCallback,
  ImmediatePriority as ImmediateSchedulerPriority,
  UserBlockingPriority as UserBlockingSchedulerPriority,
  NormalPriority as NormalSchedulerPriority,
  IdlePriority as IdleSchedulerPriority
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
  SyncLane
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

/**
 * @Author: wyb
 * @Descripttion: 计划更新root 源码中此处有一个任务的功能
 * @param {*} root
 * @param {*} fiber
 * @param {*} lane
 */
export function scheduleUpdateOnFiber(root, fiber, lane) {
  // 标记根赛道
  markRootUpdated(root, lane)
  // 确保调度执行root上的更新
  ensureRootIsScheduled(root)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 */
function ensureRootIsScheduled(root) {
  // 获取当前优先级最高的车道
  const nextLanes = getNextLanes(root, NoLanes)
  // 获取新的调度优先级
  const newCallbackPriority = getHighestPriorityLane(nextLanes)
  // 如果是同步(事件等)
  // 新的回调任务
  if (newCallbackPriority === SyncLane) {
    // 先把performSyncWorkOnRoot添回到同步队列中
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))
    // 将执行同步队列方法 放入微任务中
    queueMicrotask(flushSyncCallbacks)
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
    scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root)
    )
  }
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
function performConcurrentWorkOnRoot(root, timeout) {
  // 获取当前优先级最高的车道
  const nextLanes = getNextLanes(root, NoLanes) //16
  if (nextLanes === NoLanes) {
    return null
  }
  // 第一次渲染以同步的方式渲染根节点，初次渲染的时候，都是同步
  renderRootSync(root, nextLanes)
  // 开始进入提交 阶段，就是执行副作用，修改真实DOM
  const newRootFiber = root.current.alternate
  root.finishedWork = newRootFiber
  // 提交根节点
  commitRoot(root)
}
/**
 * @Author: wyb
 * @Descripttion:
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
}
/**
 * @Author: wyb
 * @Descripttion: 构建 fiber 树
 * @param {*} root
 */
function prepareFreshStack(root, renderLanes) {
  if (
    root !== workInProgressRoot ||
    workInProgressRootRenderLanes !== renderLanes
  ) {
    workInProgress = createWorkInProgress(root.current, null)
  }
  workInProgressRootRenderLanes = renderLanes
  workInProgressRoot = root
  finishQueueingConcurrentUpdates()
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
  // 自己或子有延迟副作用
  if (
    (finishedWork.subtreeFlags & Passive) !== NoFlags ||
    (finishedWork.flags & Passive) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffect) {
      rootDoesHavePassiveEffect = true
      scheduleCallback(NormalSchedulerPriority, flushPassiveEffect)
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
    console.log(
      'DOM执行变更后commitLayoutEffects~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'
    )
    // 执行layout Effect
    commitLayoutEffects(finishedWork, root)
    if (rootDoesHavePassiveEffect) {
      rootDoesHavePassiveEffect = false
      rootWithPendingPassiveEffects = root
    }
  }
  // 等DOM变更后，就可以把让root的current指向新的fiber树
  root.current = finishedWork
}
/**
 * @Author: wyb
 * @Descripttion:
 */
function flushPassiveEffect() {
  console.log('下一个宏任务中flushPassiveEffect~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
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
