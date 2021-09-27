import { inject } from 'vue'

// 全局注入的默认变量名
export const storeKey = 'store'

export function useStore(injectKey = storeKey) {
  return inject(injectKey)
}
