import { currentInstance, setCurrentInstance } from "./component"

const enum LiftCycles {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
}

export const onBeforeMount = createHook(LiftCycles.BEFORE_MOUNT)

export const onMounted = createHook(LiftCycles.MOUNTED)

export const onBeforeUpdate = createHook(LiftCycles.BEFORE_UPDATE)

export const onUpdated = createHook(LiftCycles.UPDATED)

function createHook(leftCycle) {
  // hook就是用户传入的回调
  // target标识它是哪个实例的钩子
  return function (hook, target = currentInstance) {
    injectHook(leftCycle, hook, target)
  }
}

function injectHook(type, hook, target) {
  if (!target) {
    console.warn('injcettion API can only be used during excution of setup')
  } else {
    const hooks = target[type] || (target[type] = [])
    const wrap = () => { // 为了保证在声明周期中使用 getCurrentInstance 拿到的是正确的实例
      setCurrentInstance(target)
      hook.call(target)
      setCurrentInstance(null)
    }
    hooks.push(wrap)
  }
}

export function invokeArrayFns(fns) {
  for (let i = 0; i < fns.length; i++) {
    fns[i]()
  }
}
