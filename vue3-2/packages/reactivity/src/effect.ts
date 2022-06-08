export let activeEffect = undefined

function cleanEffect(effect) {
  const deps = effect.deps
  for (const dep of deps) {
    dep.delete(effect)
  }
  effect.deps.length = 0
}

/**
 * @Author: wyb
 * @Descripttion: 响应式的 effect
 */
export class ReactiveEffect {
  public active = true // 当前active是否激活
  public parent = null
  public deps = [] // 被哪些属性用到了
  constructor(public fn, public scheduler?) {
    this.fn = fn
    this.scheduler = scheduler
  }
  /**
   * @Author: wyb
   * @Descripttion:
   */
  run() {
    if (!this.active) return this.fn()
    try {
      this.parent = activeEffect
      activeEffect = this
      cleanEffect(this)
      return this.fn()
    } finally {
      activeEffect = this.parent
      this.parent = null
    }
  }
  /**
   * @Author: wyb
   * @Descripttion:
   */
  stop() {
    if (this.active) {
      this.active = false
      cleanEffect(this)
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} fn
 */
export function effect(fn, options = {} as any) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  const runner = _effect.run.bind(_effect)
  runner() // 默认执行一次
  runner.effect = _effect // 暴露effect的实例 用户可以手动调用runner
  return runner
}

const targetMap = new WeakMap()

/**
 * @Author: wyb
 * @Descripttion: 依赖收集
 * @param {*} target
 * @param {*} key
 */
export function track(target, key) {
  if (!activeEffect) return
  // 先获取对象的 Map
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  // 然后获取属性的值
  let deps = depsMap.get(key)
  if (!deps) depsMap.set(key, (deps = new Set()))
  // 收集effect
  trackEffects(deps)
}

/**
 * @Author: wyb
 * @Descripttion: 收集effect
 * @param {*} deps
 */
export function trackEffects(deps) {
  if (activeEffect && !deps.has(activeEffect)) {
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
  }
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} target
 * @param {*} key
 */
export function trigger(target, key) {
  // 先获取对象的 Map
  let depsMap = targetMap.get(target)
  if (!depsMap) return
  // 然后获取属性的值
  let deps = depsMap.get(key)
  // 执行收集的effect
  triggerEffects(deps)
}

/**
 * @Author: wyb
 * @Descripttion: 执行收集的effect
 * @param {*} effects
 */
export function triggerEffects(effects) {
  if (effects) {
    // 防止在 cleanEffect 的时候造成的死循环
    effects = new Set(effects)
    effects.forEach(effect => {
      if (effect !== activeEffect) {
        if (effect.scheduler) {
          effect.scheduler()
        } else {
          effect.run()
        }
      }
    })
  }
}
