
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
} else if(setImmediate){
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