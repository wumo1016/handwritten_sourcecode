// const scope2 = effectScope().run(()=>ref(100));
// console.log(scope2)
export let activeEffectScope
export function recordEffectScope(effect) {
  if (activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(effect)
  }
}
// effectScope 基本收集 子 scope的能力
class EffectScope {
  public effects = [] // 用于存放effect的列表
  public parent;
  public active = true;
  public scopes = []; // 用它来存储scope
  constructor(detached) {
    if (!detached && activeEffectScope) {
      activeEffectScope.scopes.push(this);
    }
  }
  run(fn) {
    if (this.active) {
      try {
        this.parent = activeEffectScope
        activeEffectScope = this;
        return fn(); // scope.run()  用户里面放的函数的返回值  -> fn执行会去调用 effect()
      } finally {
        activeEffectScope = this.parent;
      }
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      this.effects.forEach(effect => effect.stop());
    }
    if (this.scopes) {
      this.scopes.forEach(scopeEffect => scopeEffect.stop());
    }
  }
}
export function effectScope(detached) {
  return new EffectScope(detached);
}
// 这里又实现了一遍effect，让effectScope能记录 effect