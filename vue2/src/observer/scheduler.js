import { nextTick } from "../utils"

let queue = []
let has = {} // 做 watcher 维护
let pedding = false

function flushSchedulerQueue() {
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
    if (!pedding) {
      nextTick(flushSchedulerQueue)
      pedding = true
    }
  }
}
