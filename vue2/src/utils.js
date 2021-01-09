export const isFunction = value => typeof value === 'function'

export const isObject = value => (typeof value === 'object') && value !== null

// nextTick
let cbs = [],
  waiting = false

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

// mergeOptions
const strats = {}
const lifeCycleHooks = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
]
// 由于 mergeOptions 第一次执行的时候 parentVal 一定是{} 所有后面的 parentVal 一定是数组
lifeCycleHooks.forEach(hook => {
  strats[hook] = mergeHook
})

function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal)
    } else {
      return [childVal]
    }
  } else {
    return parentVal
  }
}

export function mergeOptions(parent, child) {
  const options = {}
  for (const key in parent) {
    mergeField(key)
  }
  for (const key in child) {
    if (parent.hasOwnProperty(key)) {
      break
    }
    mergeField(key)
  }

  function mergeField(key) {
    const parentVal = parent[key]
    const childVal = child[key]
    // 策略模式
    // 如果有对象的策略 走策略方法
    const strat = strats[key] || defaultStrat
    options[key] = strat(parentVal, childVal, key)
  }

  function defaultStrat(parentVal, childVal, key) {
    if (isObject(parentVal) && isObject(childVal)) {
      options[key] = {
        ...parentVal,
        ...childVal
      }
    } else {
      options[key] = childVal
    }
  }
  return options
}