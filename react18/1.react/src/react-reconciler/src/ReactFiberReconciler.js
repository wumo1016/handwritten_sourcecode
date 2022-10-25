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
 * @param {*} element 虚拟DOM
 * @param {*} containerDOM容器 FiberRootNode containerInfo div#root
 */
export function updateContainer(element, container) {
  // 获取当前的根fiber
  const current = container.current
  //创建更新
  const update = createUpdate()
  //要更新的虚拟DOM
  update.payload = { element } // h1
  // 把此更新对象添加到current这个根Fiber的更新队列上,返回根节点
  const root = enqueueUpdate(current, update)

  scheduleUpdateOnFiber(root)
}
