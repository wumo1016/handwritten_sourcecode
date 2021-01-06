import { nextTick } from "../utils"

let queue = []
let has = {} // 做 watcher 维护
let pedding = false

function flushSchedulerQueue() {
  log('执行更新操作')
  for (let i = 0; i < queue.length; i++) {
    queue[i].run()
  }
  queue = []
  has = {}
  pedding = false
}

export function queueWatcher(watcher) {
  const {
    id
  } = watcher
  if (!has[id]) {
    has[id] = true
    queue.push(watcher)
    if(!pedding){
      pedding = true
      nextTick(flushSchedulerQueue)
    }
  }
}

// 当多个不同的watcher进来时，会不断执行相同的 flushSchedulerQueue 但其实不需要
// 因为第一次的 flushSchedulerQueue 时微任务还没有执行 而queue已经新增 
// 所以不需要多次执行 flushSchedulerQueue
// 所有需要做个标记 当 flushSchedulerQueue 执行过后 再执行新的 flushSchedulerQueue
