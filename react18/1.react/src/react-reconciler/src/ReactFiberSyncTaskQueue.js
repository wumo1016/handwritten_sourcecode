import {
  DiscreteEventPriority,
  getCurrentUpdatePriority,
  setCurrentUpdatePriority
} from './ReactEventPriorities'

// 同步队列
let syncQueue = null
// 是否正在执行同步队列
let isFlushingSyncQueue = false

/**
 * @Author: wyb
 * @Descripttion: 将同步回调添加进同步队列
 * @param {*} callback
 */
export function scheduleSyncCallback(callback) {
  if (syncQueue === null) {
    syncQueue = [callback]
  } else {
    syncQueue.push(callback)
  }
}
/**
 * @Author: wyb
 * @Descripttion: 执行同步队列 并清空
 */
export function flushSyncCallbacks() {
  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true
    // 暂存当前的更新优先级
    const previousUpdatePriority = getCurrentUpdatePriority()
    try {
      const isSync = true
      const queue = syncQueue
      // 把优先级设置为同步优先级 1
      setCurrentUpdatePriority(DiscreteEventPriority)
      for (let i = 0; i < queue.length; i++) {
        let callback = queue[i]
        do {
          callback = callback(isSync)
        } while (callback !== null)
      }
      // 清空
      syncQueue = null
    } finally {
      setCurrentUpdatePriority(previousUpdatePriority)
      isFlushingSyncQueue = false
    }
  }
}
