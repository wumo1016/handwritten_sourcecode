/**
 * @Author: wyb
 * @Descripttion: 响应式的 effect
 */
export class Reactiveeffect {
  public active = true
  constructor(public fn) {
    this.fn = fn
  }
  /**
   * @Author: wyb
   * @Descripttion:
   */
  run() {
    this.fn()
  }
  /**
   * @Author: wyb
   * @Descripttion:
   */
  stop() {}
}

export function effect(fn) {
  const _effect = new Reactiveeffect(fn)
  _effect.run()
}
