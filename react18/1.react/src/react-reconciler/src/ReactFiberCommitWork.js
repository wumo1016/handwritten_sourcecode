import {
  appendChild,
  insertBefore,
  commitUpdate,
  removeChild
} from 'react-dom-bindings/src/client/ReactDOMHostConfig'
import {
  Placement,
  MutationMask,
  Update,
  Passive,
  LayoutMask,
  Ref
} from './ReactFiberFlags'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText
} from './ReactWorkTags'
import {
  HasEffect as HookHasEffect,
  Passive as HookPassive,
  Layout as HookLayout
} from './ReactHookEffectTags'
let hostParent = null

/**
 * 遍历fiber树，执行fiber上的副作用
 * @param {*} fiber fiber节点
 * @param {*} root 根节点
 */
export function commitMutationEffectsOnFiber(fiber, root) {
  const oldFiber = fiber.alternate
  const flags = fiber.flags
  switch (fiber.tag) {
    case FunctionComponent: {
      // 先遍历它们的子节点，处理它们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, fiber)
      // 再处理自己身上的副作用
      commitReconciliationEffects(fiber)
      if (flags & Update) {
        commitHookEffectListUnmount(HookHasEffect | HookLayout, fiber)
      }
      break
    }
    case HostRoot:
    case HostText: {
      // 先遍历它们的子节点，处理它们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, fiber)
      // 再处理自己身上的副作用
      commitReconciliationEffects(fiber)
      break
    }
    case HostComponent: {
      // 先遍历它们的子节点，处理它们的子节点上的副作用
      recursivelyTraverseMutationEffects(root, fiber)
      // 再处理自己身上的副作用
      commitReconciliationEffects(fiber)
      // 处理ref
      if (flags & Ref) {
        commitAttachRef(fiber)
      }
      // 处理DOM更新
      if (flags & Update) {
        // 获取真实DOM
        const dom = fiber.stateNode
        // 更新真实DOM
        if (dom !== null) {
          const newProps = fiber.memoizedProps
          const oldProps = oldFiber !== null ? oldFiber.memoizedProps : newProps
          const type = fiber.type
          const updatePayload = fiber.updateQueue
          fiber.updateQueue = null
          if (updatePayload) {
            commitUpdate(dom, updatePayload, type, oldProps, newProps, fiber)
          }
        }
      }
      break
    }
    default:
      break
  }
}
/**
 * 递归遍历处理子变更的作用
 * @param {*} root 根节点
 * @param {*} curFiber
 */
function recursivelyTraverseMutationEffects(root, curFiber) {
  // 先把父fiber上该删除的节点都删除
  const deletions = curFiber.deletions
  if (deletions !== null) {
    for (let i = 0; i < deletions.length; i++) {
      const childToDelete = deletions[i]
      commitDeletionEffects(root, curFiber, childToDelete)
    }
  }
  // 再去处理剩下的子节点 (如果此fiber的父fiber已经是新增或更新的 则当前fiber就不会进入)
  if (curFiber.subtreeFlags & MutationMask) {
    let { child } = curFiber
    while (child !== null) {
      commitMutationEffectsOnFiber(child, root)
      child = child.sibling
    }
  }
}
/**
 * 提交删除副作用
 * @param {*} root 根节点
 * @param {*} parentFiber 父fiber
 * @param {*} deletedFiber 删除的fiber
 */
function commitDeletionEffects(root, parentFiber, deletedFiber) {
  let parent = parentFiber
  // 一直向上找，找到真实的DOM节点为此
  findParent: while (parent !== null) {
    switch (parent.tag) {
      case HostComponent: {
        hostParent = parent.stateNode
        break findParent
      }
      case HostRoot: {
        hostParent = parent.stateNode.containerInfo
        break findParent
      }
    }
    parent = parent.return
  }
  commitDeletionEffectsOnFiber(root, parentFiber, deletedFiber)
  hostParent = null
}
/**
 * @Author: wyb
 * @Descripttion:
 */
function commitDeletionEffectsOnFiber(
  root,
  nearestMountedAncestor,
  deletedFiber
) {
  switch (deletedFiber.tag) {
    case FunctionComponent: {
      // todo
      break
    }
    case HostComponent:
    case HostText: {
      // 先把自己的子节点删除 (如果子组件有类组件，需要处理声明周期)
      recursivelyTraverseDeletionEffects(
        root,
        nearestMountedAncestor,
        deletedFiber
      )
      // 把自己删除
      if (hostParent !== null) {
        removeChild(hostParent, deletedFiber.stateNode)
      }
      break
    }
    default:
      break
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 * @param {*} nearestMountedAncestor
 * @param {*} parent
 */
function recursivelyTraverseDeletionEffects(
  root,
  nearestMountedAncestor,
  parent
) {
  let child = parent.child
  while (child !== null) {
    commitDeletionEffectsOnFiber(root, nearestMountedAncestor, child)
    child = child.sibling
  }
}
/**
 * @Author: wyb
 * @Descripttion: 处理自身的副作用
 * @param {*} fiber
 */
function commitReconciliationEffects(fiber) {
  const { flags } = fiber
  // 插入
  if (flags & Placement) {
    // 进行插入操作，也就是把此fiber对应的真实DOM节点添加到父真实DOM节点上
    commitPlacement(fiber)
    // 把flags里的Placement删除
    fiber.flags & ~Placement
  }
}
/**
 * 把此fiber的真实DOM插入到父DOM里
 * @param {*} fiber
 */
function commitPlacement(fiber) {
  const parentFiber = getHostParentFiber(fiber)
  switch (parentFiber.tag) {
    case HostRoot: {
      const parent = parentFiber.stateNode.containerInfo
      const before = getHostSibling(fiber) // 获取最近的弟弟真实DOM节点
      insertOrAppendPlacementNode(fiber, before, parent)
      break
    }
    case HostComponent: {
      const parent = parentFiber.stateNode
      const before = getHostSibling(fiber)
      insertOrAppendPlacementNode(fiber, before, parent)
      break
    }
    default:
      break
  }
}
/**
 * 把子节点对应的真实DOM插入到父节点DOM中
 * @param {*} curFiber 将要插入的fiber节点
 * @param {*} parentDom 父真实DOM节点
 */
function insertOrAppendPlacementNode(curFiber, beforeDom, parentDom) {
  const { tag } = curFiber
  // 判断此fiber对应的节点是不是真实DOM节点
  const isHost = tag === HostComponent || tag === HostText
  // 如果是的话直接插入
  if (isHost) {
    const { stateNode } = curFiber
    if (beforeDom) {
      insertBefore(parentDom, stateNode, beforeDom)
    } else {
      appendChild(parentDom, stateNode)
    }
  } else {
    // 如果node不是真实的DOM节点，获取它的大儿子
    const { child } = curFiber
    if (child !== null) {
      // 把大儿子添加到父亲DOM节点里面去
      insertOrAppendPlacementNode(child, beforeDom, parentDom)
      let { sibling } = child
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, beforeDom, parentDom)
        sibling = sibling.sibling
      }
    }
  }
}
/**
 * 找到要插入的锚点
 * 找到可以插在它的前面的那个fiber对应的真实DOM
 * @param {*} fiber
 */
function getHostSibling(fiber) {
  let node = fiber
  siblings: while (true) {
    while (node.sibling === null) {
      // 如果没有父亲 或者 父亲是真实节点，直接返回
      if (node.return === null || isHostParent(node.return)) {
        return null
      }
      node = node.return
    }
    node = node.sibling
    // 如果弟弟不是原生节点也不是文本节点
    while (node.tag !== HostComponent && node.tag !== HostText) {
      // 如果此节点是一个将要插入的新的节点，找它的弟弟
      if (node.flags & Placement) {
        continue siblings
      } else {
        node = node.child
      }
    }
    if (!(node.flags & Placement)) {
      return node.stateNode
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion: 获取真实节点的父fiber
 * @param {*} fiber
 */
function getHostParentFiber(fiber) {
  let parent = fiber.return
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent
    }
    parent = parent.return
  }
  parent
}
/**
 * @Author: wyb
 * @Descripttion: 是否是父fiber
 * @param {*} fiber
 */
function isHostParent(fiber) {
  return fiber.tag === HostComponent || fiber.tag == HostRoot //div#root
}
/**
 * @Author: wyb
 * @Descripttion: 执行挂载副作用(useEffect)
 * @param {*} root
 * @param {*} fiber
 */
export function commitPassiveMountEffects(root, fiber) {
  commitPassiveMountOnFiber(root, fiber)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 * @param {*} fiber
 */
function commitPassiveMountOnFiber(root, fiber) {
  const flags = fiber.flags
  switch (fiber.tag) {
    case HostRoot: {
      recursivelyTraversePassiveMountEffects(root, fiber)
      break
    }
    case FunctionComponent: {
      recursivelyTraversePassiveMountEffects(root, fiber)
      // 如果有 effect 就执行
      if (flags & Passive) {
        commitHookPassiveMountEffects(fiber, HookHasEffect | HookPassive)
      }
      break
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion: 递归处理
 * @param {*} root
 * @param {*} parentFiber
 */
function recursivelyTraversePassiveMountEffects(root, parentFiber) {
  if (parentFiber.subtreeFlags & Passive) {
    let child = parentFiber.child
    while (child !== null) {
      commitPassiveMountOnFiber(root, child)
      child = child.sibling
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fiber
 * @param {*} hookFlags
 */
function commitHookPassiveMountEffects(fiber, hookFlags) {
  commitHookEffectListMount(hookFlags, fiber)
}
/**
 * @Author: wyb
 * @Descripttion: 真实调用 effect 的函数
 * @param {*} flags
 * @param {*} fiber
 */
function commitHookEffectListMount(flags, fiber) {
  const updateQueue = fiber.updateQueue
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null
  if (lastEffect !== null) {
    // 获取第一个effect
    const firstEffect = lastEffect.next
    let effect = firstEffect
    // 遍历 effect
    do {
      // 如果此 effect类型和传入的相同，都是 9 HookHasEffect | HookLayout
      if ((effect.tag & flags) === flags) {
        const create = effect.create
        effect.destroy = create() // 执行获取 destroy 方法
      }
      effect = effect.next
    } while (effect !== firstEffect)
  }
}
/**
 * @Author: wyb
 * @Descripttion: 执行卸载副作用(useEffect)
 * @param {*} fiber
 * @param {*} hookFlags
 */
export function commitPassiveUnmountEffects(fiber) {
  commitPassiveUnmountOnFiber(fiber)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fiber
 */
function commitPassiveUnmountOnFiber(fiber) {
  const flags = fiber.flags
  switch (fiber.tag) {
    case HostRoot: {
      recursivelyTraversePassiveUnmountEffects(fiber)
      break
    }
    case FunctionComponent: {
      recursivelyTraversePassiveUnmountEffects(fiber)
      if (flags & Passive) {
        commitHookPassiveUnmountEffects(fiber, HookHasEffect | HookPassive)
      }
      break
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} parentFiber
 */
function recursivelyTraversePassiveUnmountEffects(parentFiber) {
  if (parentFiber.subtreeFlags & Passive) {
    let child = parentFiber.child
    while (child !== null) {
      commitPassiveUnmountOnFiber(child)
      child = child.sibling
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fiber
 * @param {*} hookFlags
 */
function commitHookPassiveUnmountEffects(fiber, hookFlags) {
  commitHookEffectListUnmount(hookFlags, fiber)
}
/**
 * @Author: wyb
 * @Descripttion: 真实调用 effect 卸载 的函数
 * @param {*} flags
 * @param {*} fiber
 */
function commitHookEffectListUnmount(flags, fiber) {
  const updateQueue = fiber.updateQueue
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null
  if (lastEffect !== null) {
    // 获取 第一个effect
    const firstEffect = lastEffect.next
    let effect = firstEffect
    do {
      // 如果此 effect类型和传入的相同，都是 9 HookHasEffect | PassiveEffect
      if ((effect.tag & flags) === flags) {
        const destroy = effect.destroy
        if (destroy !== undefined) {
          destroy()
        }
      }
      effect = effect.next
    } while (effect !== firstEffect)
  }
}
/**
 * @Author: wyb
 * @Descripttion: 执行 useLayoutEffect
 * @param {*} fiber
 * @param {*} root
 */
export function commitLayoutEffects(fiber, root) {
  const oldRootFiber = fiber.alternate
  commitLayoutEffectOnFiber(root, oldRootFiber, fiber)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} finishedRoot
 * @param {*} current
 * @param {*} fiber
 */
function commitLayoutEffectOnFiber(finishedRoot, current, fiber) {
  const flags = fiber.flags
  switch (fiber.tag) {
    case HostRoot: {
      recursivelyTraverseLayoutEffects(finishedRoot, fiber)
      break
    }
    case FunctionComponent: {
      recursivelyTraverseLayoutEffects(finishedRoot, fiber)
      if (flags & LayoutMask) {
        // LayoutMask=Update=4
        commitHookLayoutEffects(fiber, HookHasEffect | HookLayout)
      }
      break
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 * @param {*} parentFiber
 */
function recursivelyTraverseLayoutEffects(root, parentFiber) {
  if (parentFiber.subtreeFlags & LayoutMask) {
    let child = parentFiber.child
    while (child !== null) {
      const current = child.alternate
      commitLayoutEffectOnFiber(root, current, child)
      child = child.sibling
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fiber
 * @param {*} hookFlags
 */
function commitHookLayoutEffects(fiber, hookFlags) {
  commitHookEffectListMount(hookFlags, fiber)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fiber
 */
function commitAttachRef(fiber) {
  const ref = fiber.ref
  if (ref !== null) {
    const instance = fiber.stateNode
    if (typeof ref === 'function') {
      ref(instance)
    } else {
      ref.current = instance
    }
  }
}
