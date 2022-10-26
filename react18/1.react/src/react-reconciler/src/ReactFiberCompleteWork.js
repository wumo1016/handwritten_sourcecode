import logger, { indent } from 'shared/logger'
import {
  createTextInstance,
  createInstance
  //   appendInitialChild,
  //   finalizeInitialChildren
} from 'react-dom-bindings/src/client/ReactDOMHostConfig'
import { NoFlags } from './ReactFiberFlags'
import { HostComponent, HostRoot, HostText } from './ReactWorkTags'

/**
 * 完成一个fiber节点
 * @param {*} oldFiber 老fiber
 * @param {*} newFiber 新的构建的fiber
 */
export function completeWork(oldFiber, newFiber) {
  indent.number -= 2
  logger(' '.repeat(indent.number) + 'completeWork', newFiber)
  const newProps = newFiber.pendingProps
  switch (newFiber.tag) {
    //   case HostRoot:
    //     bubbleProperties(newFiber);
    //     break;
    // 如果完成的是原生节点的话
    case HostComponent:
      ///现在只是在处理创建或者说挂载新节点的逻辑，后面此处分进行区分是初次挂载还是更新
      //创建真实的DOM节点
      const { type } = newFiber
      const instance = createInstance(type, newProps, newFiber)
      // //把自己所有的儿子都添加到自己的身上
      // appendAllChildren(instance, newFiber)
      // newFiber.stateNode = instance
      // finalizeInitialChildren(instance, type, newProps)
      // bubbleProperties(newFiber)
      break
    case HostText:
      // 如果完成的fiber是文本节点，那就创建真实的文本节点
      const newText = newProps
      // 创建真实的DOM节点并传入stateNode
      newFiber.stateNode = createTextInstance(newText)
      // 向上冒泡属性
      bubbleProperties(newFiber)
      break
  }
}
/**
 * 把当前的完成的fiber所有的子节点对应的真实DOM都挂载到自己父parent真实DOM节点上
 * @param {*} parent 当前完成的fiber真实的DOM节点
 * @param {*} workInProgress 完成的fiber
 */
function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child
  while (node) {
    //如果子节点类型是一个原生节点或者是一个文件节点
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode)
      //如果第一个儿子不是一个原生节点，说明它可能是一个函数组件
    } else if (node.child !== null) {
      node = node.child
      continue
    }
    if (node === workInProgress) {
      return
    }
    //如果当前的节点没有弟弟
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return
      }
      //回到父节点
      node = node.return
    }
    node = node.sibling
  }
}
/**
 * @Author: wyb
 * @Descripttion: 更新当前节点的subtreeFlags 就是子节点有什么操作 例如更新、插入等
 * @param {*} curFiber
 */
function bubbleProperties(curFiber) {
  let subtreeFlags = NoFlags
  // 遍历当前fiber的所有子节点
  // 把所有的子节的副作用，以及子节点的子节点的副作用全部合并
  let child = curFiber.child
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags
    subtreeFlags |= child.flags
    child = child.sibling
  }
  curFiber.subtreeFlags = subtreeFlags
}
