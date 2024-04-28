/*
 * @Description:
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-04-28 19:42:34
 */

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive' // 是否被 reactive 代理过
}

export enum DirtyLevels {
  NotDirty = 0, // 不脏, 使用旧值
  Dirty = 2 // 脏值, 需要更新
}
