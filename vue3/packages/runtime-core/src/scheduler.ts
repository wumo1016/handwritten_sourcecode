// 任务队列
const queue = []
export function queueJob(job){
  if(!queue.includes(job)){
    queue.push(job)
    queueFlush()
  }
}

// 刷新队列
let isFlushPendding = false
function queueFlush(){
  if(!isFlushPendding){
    isFlushPendding = true
    Promise.resolve().then(flushJobs)
  }
}

// 清空队列
function flushJobs(){
  isFlushPendding = false
  // 清空时 需要根据调用的顺序依次刷新
  // 保证先更新父 再更新子
  queue.sort((a, b) => a.uid - b.uid)
  // 依次调用回调
  for (let i = 0; i < queue.length; i++) {
    const cb = queue[i]
    cb()
  }
  queue.length = 0
}
