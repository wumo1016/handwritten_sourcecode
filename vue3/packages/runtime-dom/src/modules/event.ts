
export const patchEvent = (el, key, value) => {

  const invokers = el._vei || (el._vei = {}) // 对事件函数缓存 vei = vue event invokers
  const exist = invokers[key]

  if (value && exist) { // 老的有 新的也有 将绑定函数的value改掉
    exist.value = value
  } else {
    const eventName = key.slice(2).toLowerCase() // 获取事件名
    if (value) { // 老的没有 新的有 直接添加
      const invoker = invokers[key] = createInvoker(value)
      el.addEventListener(eventName, invoker)
    } else if(exist){ // 老的有 新的没有 直接移除
      el.removeEventListener(eventName, exist)
      invokers[key] = undefined
    }
  }
}

function createInvoker(value) {
  const invoker = (e) => {
    invoker.value(e)
  }
  invoker.value = value
  return invoker
}
