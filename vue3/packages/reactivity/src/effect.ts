import { isArray, isIntegerKey } from "@vue/shared/src"
import { TiggerOpTypes } from "./operators"

export function effect(fn, options: any = {}) {
  const effect = createReactiveEffect(fn, options)

  // 默认会执行一次
  if (!options.lazy) {
    effect()
  }

  return effect
}

let uid = 0
let stackEffect = []
let activeEffect

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!stackEffect.includes(effect)) {
      try {
        stackEffect.push(effect)
        activeEffect = effect
        return fn()
      } finally {
        stackEffect.pop()
        activeEffect = stackEffect[stackEffect.length - 1]
      }
    }
  }
  effect.uid = uid++ // effect的唯一标识
  effect._isEffect = true // 这是一个响应式 effect
  effect.raw = fn // 记录用户传入的函数
  effect.options = options // 记录用户传入的配置
  return effect
}

const targetMap = new WeakMap()

/* 属性对应 effect 结构
WeakMap[
  {name: 'wyb'}: Map[
    name: Set[ effect1, effect2 ]
  ]
]
*/

export function track(target, type, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map))
  }
  let depSet = depsMap.get(key)
  if (!depSet) {
    depsMap.set(key, (depSet = new Set))
  }
  if (!depSet.has(activeEffect)) {
    depSet.add(activeEffect)
  }
}

export function tigger(target, type, key, newValue?, oldValue?) {

  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  // 将所有要执行的effect放到一个新的集合中，最终一起执行
  const effects = new Set()
  const add = sets => {
    if(!sets) return
    sets.forEach(effect => {
      effects.add(effect)
    })
  }
  
  // 如果修改的是数组的长度(1.依赖数组长度要更新 2.索引大于新数组长度的要更新) 
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((depSet, k) => {
      if (typeof k !== 'symbol' && (k === 'length' || k >= newValue)) {
        add(depSet)
      }
    });
  } else { // 可能是对象
    if(key !== undefined) add(depsMap.get(key))
    // 通过索引添加数组元素
    switch(type){
      case TiggerOpTypes.ADD:
        if(Array.isArray(target) && isIntegerKey(key)){
          add(depsMap.get('length'))
        }
    }
  }

  effects.forEach((effect: any) => {
    if(effect.options.scheduler){
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  })

}

/* 案例1 所以effect需要做一个栈管理
effect(() => {
  state.name
  effect(() => {
    state.age
  })
  state.height
})
*/

/* 案例2 需要排除重复effect 防止死循环
effect(() => {
  state.name++
})
*/
