import { h, inject, provide, computed } from 'vue'

export const RouterView = {
  name: 'RouterView',
  setup(props, { slots }) {
    // 拿到当前路径匹配的路由
    const currentRoute = inject('routeLocation')

    const depth = inject('router-depth', 0) // 默认值就是0

    const macthRouteRef = computed(() => currentRoute.matched[depth])

    provide('router-depth', depth + 1)

    return () => {
      const macthRoute = macthRouteRef.value
      const viewComponent = macthRoute && macthRoute.components.default
      return viewComponent ? h(viewComponent) : slots.default && slots.default()
    }
  }
}
