import { Pinia, piniaSymbol } from "./types";

export function createPinia(): Pinia {

  const pinia: Pinia = {
    install(app) {
      app.provide(piniaSymbol, pinia)
    }
  }

  return pinia
}