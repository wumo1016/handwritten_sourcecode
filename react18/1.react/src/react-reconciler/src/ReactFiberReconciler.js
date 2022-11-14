import { createFiberRoot } from './ReactFiberRoot'
import { createUpdate, enqueueUpdate } from './ReactFiberClassUpdateQueue'
import { scheduleUpdateOnFiber, requestUpdateLane, requestEventTime } from './ReactFiberWorkLoop'

/**
 * @Author: wyb
 * @Descripttion: 创建容器
 * @param {*} containerInfo
 */
export function createContainer(containerInfo) {
  return createFiberRoot(containerInfo)
}
/**
 * @Author: wyb
 * @Descripttion: 更新容器，把虚拟dom element变成真实DOM插入到container容器中
 * @param {*} vdom 虚拟DOM
 * @param {*} container DOM容器 FiberRootNode containerInfo div#root
 */
export function updateContainer(vdom, container) {
  // 获取当前的根fiber
  const rootFiber = container.current
  // 当前时间
  const eventTime = requestEventTime()
  // 请求一个更新车道 16
  const lane = requestUpdateLane(rootFiber)
  // 创建更新
  const update = createUpdate(lane)
  // 要更新的虚拟DOM
  update.payload = { element: vdom } // h1
  // 把此更新对象添加到 rootFiber 这个根Fiber的更新队列上,返回根节点
  const root = enqueueUpdate(rootFiber, update, lane)
  // 更新
  scheduleUpdateOnFiber(root, rootFiber, lane, eventTime)
}
