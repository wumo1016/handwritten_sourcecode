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
    ]
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

export default router
