export const isFunction = value => typeof value === 'function'

export const isObject = value => (typeof value === 'object') && value !== null

let cbs = []
let waiting = false

function flushCallbacks() {
  cbs.forEach(cb => cb())
  waiting = false
  cbs = []
}

let timerFn = () => {}

if (Promise) {
  timerFn = () => Promise.resolve().then(flushCallbacks)
} else if (MutationObserver) {
  const textNode = document.createTextNode(1)
  const observer = new MutationObserver(flushCallbacks)
  observer.observe(textNode, {
    characterData: true
  })
  timerFn = () => {
    textNode.textContent = 3
  }
} else if (setImmediate) {
  timerFn = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFn = () => {
    setTimeout(flushCallbacks)
  }
}

export function nextTick(cb) {
  cbs.push(cb)
  if (!waiting) {
    timerFn()
    waiting = true
  }
}
// 同理 由于 timerFn 是异步任务，所有连续多次调用 nextTick 时
// cbs 已经更新 当由于前面的 timerFn 还未执行
// 所以新的 timerFn 没有必要再次执行
// 所以也做一个标记
// 等老的 timerFn 执行完以后再执行新的 timerFn