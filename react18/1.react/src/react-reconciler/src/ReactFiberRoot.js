import { createHostRootFiber } from './ReactFiber'
import { initialUpdateQueue } from './ReactFiberClassUpdateQueue'
import { createLaneMap, NoLane, NoLanes, NoTimestamp } from './ReactFiberLane'

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} containerInfo
 */
export function createFiberRoot(containerInfo) {
  const root = new FiberRootNode(containerInfo)
  // HostRoot指的就是根节点div#root
  const uninitializedFiber = createHostRootFiber()
  // 根容器的current指向当前的根fiber
  root.current = uninitializedFiber
  // 根fiber的stateNode,也就是真实DOM节点指向FiberRootNode
  uninitializedFiber.stateNode = root
  // 初始化队列 设置下根 fiber 的 updateQueue
  initialUpdateQueue(uninitializedFiber)
  return root
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} containerInfo  // div#root
 */
function FiberRootNode(containerInfo) {
  this.containerInfo = containerInfo
  // 表示此根上有哪些赛道等待被处理
  this.pendingLanes = NoLanes
  this.callbackNode = null
  this.callbackPriority = NoLane
  // 过期时间 存放每个赛道过期时间
  this.expirationTimes = createLaneMap(NoTimestamp)
  // 过期的赛道
  this.expiredLanes = NoLanes
}
