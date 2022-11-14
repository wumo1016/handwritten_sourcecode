import { allowConcurrentByDefault } from 'shared/ReactFeatureFlags'

export const TotalLanes = 31
export const NoLanes = 0b0000000000000000000000000000000
export const NoLane = 0b0000000000000000000000000000000
export const SyncLane = 0b0000000000000000000000000000001
export const InputContinuousHydrationLane = 0b0000000000000000000000000000010
export const InputContinuousLane = 0b0000000000000000000000000000100
export const DefaultHydrationLane = 0b0000000000000000000000000001000
export const DefaultLane = 0b0000000000000000000000000010000
export const SelectiveHydrationLane = 0b0001000000000000000000000000000
export const IdleHydrationLane = 0b0010000000000000000000000000000
export const IdleLane = 0b0100000000000000000000000000000
export const OffscreenLane = 0b1000000000000000000000000000000
const NonIdleLanes = 0b0001111111111111111111111111111
// 没有时间戳
export const NoTimestamp = -1
/**
 * @Author: wyb
 * @Descripttion: 标记根更新
 * @param {*} root
 * @param {*} updateLane
 */
export function markRootUpdated(root, updateLane) {
  // pendingLanes指的此根上等待生效的lane
  root.pendingLanes |= updateLane
}
/**
 * @Author: wyb
 * @Descripttion: 获取最高优先级车道
 * @param {*} root
 * @param {*} wipLanes 新的渲染车道
 */
export function getNextLanes(root, wipLanes) {
  // 先获取所有的有更新的车道
  const pendingLanes = root.pendingLanes
  if (pendingLanes == NoLanes) {
    return NoLanes
  }
  // 获取所有的车道中最高优先级的车道
  const nextLanes = getHighestPriorityLanes(pendingLanes)
  if (wipLanes !== NoLane && wipLanes !== nextLanes) {
    // 新的车道值比渲染中的车道大，说明新的车道优先级更低
    if (nextLanes > wipLanes) {
      return wipLanes
    }
  }
  return nextLanes
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} lanes
 */
export function getHighestPriorityLanes(lanes) {
  return getHighestPriorityLane(lanes)
}
/**
 * @Author: wyb
 * @Descripttion: 找到最右边的1 只能返回一个车道
 * @param {*} lanes
 */
export function getHighestPriorityLane(lanes) {
  return lanes & -lanes
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} lanes
 * 源码此处的逻辑有大的改变动
 *
 * 以前
 * pendingLanes= 001100
 * 找到最右边的1  000100
 * nextLanes     000111 (左移一位再减1)
 *
 * 现在的源码已经改了
 * pendingLanes= 001100
 * 找到最右边的1  000100
 *  update 000010
 * 那是不是意味着以前是不检测车道上有没有任务的，就是先拿优先级再检测？
 */
export function includesNonIdleWork(lanes) {
  return (lanes & NonIdleLanes) !== NoLanes
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} set
 * @param {*} subset
 */
export function isSubsetOfLanes(set, subset) {
  return (set & subset) === subset
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} a
 * @param {*} b
 */
export function mergeLanes(a, b) {
  return a | b
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 * @param {*} lanes
 */
export function includesBlockingLane(root, lanes) {
  // 如果允许默认并行渲染
  if (allowConcurrentByDefault) {
    return false
  }
  const SyncDefaultLanes = InputContinuousLane | DefaultLane
  return (lanes & SyncDefaultLanes) !== NoLane
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} root
 * @param {*} lanes
 */
export function includesExpiredLane(root, lanes) {
  return (lanes & root.expiredLanes) !== NoLanes
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} initial
 */
export function createLaneMap(initial) {
  const laneMap = []
  for (let i = 0; i < TotalLanes; i++) {
    laneMap.push(initial)
  }
  return laneMap
}
/**
 * @Author: wyb
 * @Descripttion: 将饿死的赛道标记为已过期
 * @param {*} root
 * @param {*} currentTime
 */
export function markStarvedLanesAsExpired(root, currentTime) {
  // 获取当前更新赛道
  const pendingLanes = root.pendingLanes
  // 记录每个赛道上的过期时间
  const expirationTimes = root.expirationTimes
  let lanes = pendingLanes
  while (lanes > 0) {
    // 获取最左侧的1的索引 最低级的
    const index = pickArbitraryLaneIndex(lanes)
    // 拿到最低级的赛道
    const lane = 1 << index
    const expirationTime = expirationTimes[index]
    // 如果此赛道上没有过期时间,说明没有为此车道设置过期时间
    if (expirationTime === NoTimestamp) {
      expirationTimes[index] = computeExpirationTime(lane, currentTime)
      // 如果此车道的过期时间已经小于等于当前时间了 说明已经过期了
    } else if (expirationTime <= currentTime) {
      // 把此车道添加到过期车道里
      root.expiredLanes |= lane
      console.log(
        'expirationTime',
        expirationTime,
        'currentTime',
        currentTime,
        root.expiredLanes
      )
    }
    lanes &= ~lane
  }
}
/**
 * @Author: wyb
 * @Descripttion: 返回最左侧的1的左边0的个数
 * @param {*} lanes
 */
function pickArbitraryLaneIndex(lanes) {
  return 31 - Math.clz32(lanes)
}
/**
 * @Author: wyb
 * @Descripttion: 计算过期时间
 * @param {*} lane
 * @param {*} currentTime
 */
function computeExpirationTime(lane, currentTime) {
  switch (lane) {
    case SyncLane:
    case InputContinuousLane:
      return currentTime + 250
    case DefaultLane:
      return currentTime + 5000
    case IdleLane:
      return NoTimestamp
    default:
      return NoTimestamp
  }
}
/**
 * @Author: wyb
 * @Descripttion: 将已经完成的车道重置过期时间
 * @param {*} root
 * @param {*} remainingLanes
 */
export function markRootFinished(root, remainingLanes) {
  // pendingLanes根上所有的将要被渲染的车道 1和2
  // remainingLanes 2
  // noLongerPendingLanes指的是已经更新过的lane
  const noLongerPendingLanes = root.pendingLanes & ~remainingLanes
  root.pendingLanes = remainingLanes
  const expirationTimes = root.expirationTimes
  let lanes = noLongerPendingLanes
  while (lanes > 0) {
    //获取最左侧的1的索引
    const index = pickArbitraryLaneIndex(lanes)
    const lane = 1 << index
    //清除已经计算过的车道的过期时间
    expirationTimes[index] = NoTimestamp
    lanes &= ~lane
  }
}
