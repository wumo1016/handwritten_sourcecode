/**
 * @Author: wyb
 * @Descripttion: 处理事件 - 仅实现绑定一个事件
 * @param {*} el
 * @param {*} eventName
 * @param {*} nextValue
 */
export function patchEvent(el, eventName, nextValue) {
  const invokers = el._vei || (el._vei = {}) // 缓存事件

  const eName = eventName.slice(2).toLowerCase() // 事件名
  const exitingInvoker = invokers[eventName] // 事件是否已存在

  if (exitingInvoker && nextValue) {
    exitingInvoker.value = nextValue // 进行换绑
  } else if (nextValue) {
    const invoker = createInvoker(nextValue)
    invokers[eventName] = invoker
    el.addEventListener(eName, invoker)
  } else if (exitingInvoker) {
    el.removeEventListener(eName, exitingInvoker)
    invokers[eventName] = null
  }
}

/**
 * @Author: wyb
 * @Descripttion: 包装一下传入的函数
 * @param {*} preValue
 */
function createInvoker(preValue) {
  const invoker = e => {
    invoker.value(e)
  }
  invoker.value = preValue
  return invoker
}
