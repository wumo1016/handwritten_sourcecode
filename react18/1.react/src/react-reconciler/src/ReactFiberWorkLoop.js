import { scheduleCallback } from 'scheduler'
import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import { completeWork } from './ReactFiberCompleteWork'
import { NoFlags, MutationMask, Placement, Update } from './ReactFiberFlags'
import { commitMutationEffectsOnFiber } from './ReactFiberCommitWork'
// import { HostComponent, HostRoot, HostText } from './ReactWorkTags'

// 正在进行的工作 当前 fiber
let workInProgress = null

/**
 * @Author: wyb
 * @Descripttion: 计划更新root 源码中此处有一个任务的功能
 * @param {*} root
 */
export function scheduleUpdateOnFiber(root) {
  // 确保调度执行root上的更新
  ensureRootIsScheduled(root)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 */
function ensureRootIsScheduled(root) {
  // 告诉浏览器要执行performConcurrentWorkOnRoot
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root))
}
/**
 * @Author: wyb
 * @Descripttion: 根据fiber构建fiber树 => 要创建真实的DOM节点 => 还需要把真实的DOM节点插入容器
 * @param {*} root
 */
function performConcurrentWorkOnRoot(root) {
  // 第一次渲染以同步的方式渲染根节点，初次渲染的时候，都是同步
  renderRootSync(root)
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
function renderRootSync(root) {
  // 准备一个新的栈 根fiber
  prepareFreshStack(root)
  // 同步递归构建 fiber 树
  workLoopSync()
}
/**
 * @Author: wyb
 * @Descripttion: 构建 fiber 树
 * @param {*} root
 */
function prepareFreshStack(root) {
  workInProgress = createWorkInProgress(root.current, null)
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
  const next = beginWork(oldFiber, curFiber)
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
  let completedWork = unitOfWork
  do {
    const oldFiber = completedWork.alternate
    const returnFiber = completedWork.return
    // 执行此fiber 的完成工作,如果是原生组件的话就是创建真实的DOM节点
    completeWork(oldFiber, completedWork)
    // 如果有弟弟，就构建弟弟对应的fiber子链表
    const siblingFiber = completedWork.sibling
    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }
    // 如果没有弟弟，说明这当前完成的就是父fiber的最后一个节点
    // 也就是说一个父fiber,所有的子fiber全部完成了
    completedWork = returnFiber
    workInProgress = completedWork
  } while (completedWork !== null)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 */
function commitRoot(root) {
  const { finishedWork } = root
  // printFinishedWork(finishedWork)
  // 判断子树有没有副作用 就是有没有新增或修改
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  // 根是否有副作用
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags
  // 如果自己的副作用或者子节点有副作用就进行提交DOM操作
  if (subtreeHasEffects || rootHasEffect) {
    commitMutationEffectsOnFiber(finishedWork, root)
  }
  // 等DOM变更后，就可以把让root的current指向新的fiber树
  root.current = finishedWork
}

function printFinishedWork(fiber) {
  let child = fiber.child
  while (child) {
    printFinishedWork(child)
    child = child.sibling
  }
  if (fiber.flags !== 0) {
    console.log(
      getFlags(fiber.flags),
      getTag(fiber.tag),
      fiber.type,
      fiber.memoizedProps
    )
  }
}

function getFlags(flags) {
  if (flags === Placement) {
    return '插入'
  }
  if (flags === Update) {
    return '更新'
  }
  return flags
}

function getTag(tag) {
  switch (tag) {
    case HostRoot:
      return 'HostRoot'
    case HostComponent:
      return 'HostComponent'
    case HostText:
      return 'HostText'
    default:
      return tag
  }
}
