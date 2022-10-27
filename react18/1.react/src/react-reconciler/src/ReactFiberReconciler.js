import { createFiberRoot } from './ReactFiberRoot'
import { createUpdate, enqueueUpdate } from './ReactFiberClassUpdateQueue'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'

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
  const fiber = container.current
  // 创建更新
  const update = createUpdate()
  // 要更新的虚拟DOM
  update.payload = { element: vdom } // h1
  // 把此更新对象添加到 fiber 这个根Fiber的更新队列上,返回根节点
  const root = enqueueUpdate(fiber, update)
  // 更新
  scheduleUpdateOnFiber(root)
}
