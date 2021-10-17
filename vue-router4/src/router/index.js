import {
  createRouter,
  createWebHistory,
  createWebHashHistory
  // } from 'vue-router'
} from '@/vue-router'
import Home from '../views/home'
import About from '../views/about'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: 'a',
        component: {
          render: () => <h1>a页面</h1>
        }
      },
      {
        path: 'b',
        component: {
          render: () => <h1>b页面</h1>
        }
      }
    ],
    beforeEnter(to, from, next) {
      console.log('beforeEnter')
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.brforeEach((to, from, next) => {
  console.log('brforeEach')
})
router.beforeResolve((to, from, next) => {
  console.log('beforeResolve')
})
router.afterEach((to, from, next) => {
  console.log('afterEach')
})

export default router
