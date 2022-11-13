import { mergeLanes } from './ReactFiberLane'
import { HostRoot } from './ReactWorkTags'
const concurrentQueues = []
let concurrentQueuesIndex = 0

/**
 * 本来此文件要处理更新优先级的问题
 * 目前现在只实现向上找到根节点
 */
export function markUpdateLaneFromFiberToRoot(sourceFiber) {
  let node = sourceFiber //当前fiber
  let parent = sourceFiber.return //当前fiber父fiber
  while (parent !== null) {
    node = parent
    parent = parent.return
  }
  //一直找到parent为null
  if (node.tag === HostRoot) {
    return node.stateNode
  }
  return null
}
/**
 * 把更新队列添加到更新队列中
 * @param {*} fiber 函数组件对应的fiber
 * @param {*} queue 要更新的hook对应的更新队列
 * @param {*} update 更新对象
 */
export function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
  enqueueUpdate(fiber, queue, update, lane)
  return getRootForUpdatedFiber(fiber)
}
/**
 * 把更新先缓存到concurrentQueue数组中
 * @param {*} fiber
 * @param {*} queue
 * @param {*} update
 */
function enqueueUpdate(fiber, queue, update, lane) {
  // 四个一组缓存起来
  // 012 setNumber1 345 setNumber2 678 setNumber3
  concurrentQueues[concurrentQueuesIndex++] = fiber // 函数组件对应的fiber
  concurrentQueues[concurrentQueuesIndex++] = queue // 要更新的hook对应的更新队列
  concurrentQueues[concurrentQueuesIndex++] = update // 更新对象
  concurrentQueues[concurrentQueuesIndex++] = lane // 更新车道
  // 当我们向一个fiber上添加一个更新的时候，要把此更新的赛道合并到此fiber的赛道上
  fiber.lanes = mergeLanes(fiber.lanes, lane)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} sourceFiber
 */
function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber
  let parent = node.return
  while (parent !== null) {
    node = parent
    parent = node.return
  }
  return node.tag === HostRoot ? node.stateNode : null //FiberRootNode div#root
}
/**
 * @Author: wyb
 * @Descripttion: 将更新放到更新队列里 (在工作循环 workLoopSync 之前调用)
 */
export function finishQueueingConcurrentUpdates() {
  const endIndex = concurrentQueuesIndex
  concurrentQueuesIndex = 0
  let i = 0
  while (i < endIndex) {
    const fiber = concurrentQueues[i++]
    const queue = concurrentQueues[i++]
    const update = concurrentQueues[i++]
    const lane = concurrentQueues[i++]
    if (queue !== null && update !== null) {
      const pending = queue.pending
      if (pending === null) {
        update.next = update
      } else {
        update.next = pending.next
        pending.next = update
      }
      queue.pending = update
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fiber
 * @param {*} queue
 * @param {*} update
 * @param {*} lane
 */
export function enqueueConcurrentClassUpdate(fiber, queue, update, lane) {
  enqueueUpdate(fiber, queue, update, lane)
  return getRootForUpdatedFiber(fiber)
}
