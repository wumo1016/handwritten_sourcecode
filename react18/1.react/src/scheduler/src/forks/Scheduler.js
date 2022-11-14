import { push, peek, pop } from './SchedulerMinHeap'
import {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority
} from './SchedulerPriorities'

// 立即过期
const IMMEDIATE_PRIORITY_TIMEOUT = -1
// 用户操作优先级 250毫秒
const USER_BLOCKING_PRIORITY_TIMEOUT = 250
// 正常优先级的过期时间 5秒
const NORMAL_PRIORITY_TIMEOUT = 5000
// 低优先级过期时间 10秒
const LOW_PRIORITY_TIMEOUT = 10000
// 永远不过期
const IDLE_PRIORITY_TIMEOUT = 1073741823

// 任务ID计数器
let taskIdCounter = 1
// 任务队列 => 最小堆
const taskQueue = []
// 调度函数的回调
let scheduleHostCallback = null
// 开始执行任务的时间
let startTime = -1
let currentTask = null

// React每一帧向浏览申请5毫秒用于自己任务执行
// 如果5s内没有完成，React也会放弃控制权，把控制交还给浏览器
const frameInterval = 5

const channel = new MessageChannel()
let port2 = channel.port2
let port1 = channel.port1
port1.onmessage = performWorkUntilDeadline

/**
 * 按优先级执行任务
 * @param {*} priorityLevel 优先级
 * @param {*} callback 调度函数
 */
export function scheduleCallback(priorityLevel, callback) {
  // 获取当前的时候
  const currentTime = getCurrentTime()
  // 此任务的开时间
  const startTime = currentTime
  // 计算此任务的过期时间
  const expirationTime = startTime + getTimeout(priorityLevel)
  // 创建任务
  const newTask = {
    id: taskIdCounter++,
    callback, // 回调函数或者说任务函数
    priorityLevel, // 优先级别
    startTime, // 任务的开始时间
    expirationTime, // 任务的过期时间
    sortIndex: expirationTime // 排序依赖
  }
  // 向任务最小堆里添加任务，排序的依据是过期时间
  push(taskQueue, newTask)
  // flushWork 执行工作，刷新工作，执行任务，司机接人
  requestHostCallback(workLoop)
  return newTask
}
/**
 * @Author: wyb
 * @Descripttion: 浏览器渲染的当前时间（Date有时区问题）
 */
function getCurrentTime() {
  return performance.now()
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} priorityLevel
 */
function getTimeout(priorityLevel) {
  let timeout
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT // -1
      break
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT // 250ms
      break
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT // 10000
      break
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT //1073741823
      break
    case NormalPriority: // 5000
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT
      break
  }
  return timeout
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fn
 */
function requestHostCallback(fn) {
  // 先缓存回调函数
  scheduleHostCallback = fn
  // 执行工作直到截止时间
  schedulePerformWorkUntilDeadline()
}
/**
 * @Author: wyb
 * @Descripttion:
 */
function schedulePerformWorkUntilDeadline() {
  port2.postMessage(null)
}
/**
 * @Author: wyb
 * @Descripttion:
 */
function performWorkUntilDeadline() {
  if (scheduleHostCallback) {
    startTime = getCurrentTime()
    let hasMoreWork = true
    try {
      // 执行 flushWork ，并判断有没有返回值
      hasMoreWork = scheduleHostCallback(startTime)
    } finally {
      // 执行完以后如果为true,说明还有更多工作要做
      if (hasMoreWork) {
        // 继续执行
        schedulePerformWorkUntilDeadline()
      } else {
        scheduleHostCallback = null
      }
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} startTime
 */
function workLoop(startTime) {
  let currentTime = startTime
  // 取出优先级最高的任务
  currentTask = peek(taskQueue)
  while (currentTask !== null) {
    // 如果此任务的过期时间大于任务开始时间(说明没有过期)，并且需要放弃执行 时间片到期
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      break // 跳出工作循环
    }
    // 取出当前的任务中的回调函数  例如: performConcurrentWorkOnRoot
    const callback = currentTask.callback
    if (typeof callback === 'function') {
      currentTask.callback = null
      // 执行工作，如果返回新的函数，则表示当前的工作没有完成
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime
      const continuationCallback = callback(didUserCallbackTimeout)
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback
        return true // 还有任务要执行
      }
      // 如果此任务已经完成，则不需要再继续执行了，可以把此任务弹出
      if (currentTask === peek(taskQueue)) {
        pop(taskQueue)
      }
    } else {
      // 如果不是函数 直接弹出这个任务
      pop(taskQueue)
    }
    // 如果当前的任务执行完了，或者当前任务不合法，取出下一个任务执行
    currentTask = peek(taskQueue)
  }
  // 如果循环结束还有未完成的任务，那就表示hasMoreWork=true
  if (currentTask !== null) {
    return true
  }
  // 没有任何要完成的任务了
  return false
}
/**
 * @Author: wyb
 * @Descripttion: 本次任务执行是否已经超过5ms
 */
function shouldYieldToHost() {
  // 用当前时间减去开始的时间就是过去的时间
  const timeElapsed = getCurrentTime() - startTime
  // 如果执行时间大于指定时间 则需要中断执行
  if (timeElapsed >= frameInterval) {
    return true
  }
  // 如果流逝或者说经过的时间小于5毫秒，那就不需要放弃执行
  return false
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} task
 */
function cancelCallback(task) {
  task.callback = null
}

export {
  scheduleCallback as unstable_scheduleCallback,
  shouldYieldToHost as unstable_shouldYield,
  ImmediatePriority as unstable_ImmediatePriority,
  UserBlockingPriority as unstable_UserBlockingPriority,
  NormalPriority as unstable_NormalPriority,
  LowPriority as unstable_LowPriority,
  IdlePriority as unstable_IdlePriority,
  cancelCallback as unstable_cancelCallback,
  getCurrentTime as now
}

/* 
// 原生任务调度
export function scheduleCallback(callback) {
  requestIdleCallback(callback)
} */
