import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import Foo from './components/foo.vue'
import Bar from './components/bar.vue'

export default () => {
  const router = new VueRouter({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: Foo
      },
      {
        path: '/bar',
        component: Bar
      },
    ]
  })
  return router
}

