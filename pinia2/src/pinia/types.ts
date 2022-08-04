import { App } from "vue";


export interface Pinia {
  install: (app: App) => void
}

export const piniaSymbol = Symbol('pinia')