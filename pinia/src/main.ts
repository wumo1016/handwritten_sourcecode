import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from './pinia'
// import { createPinia } from 'pinia'


const app = createApp(App)
const pinia = createPinia();

pinia.use(function (store) { // 每个store 都要执行 要通过store名字来区分
  let local = localStorage.getItem(store._id + 'PINIA_STATE');
  if (local) {
    store.$state = JSON.parse(local)
  }
  store.$subscribe((state) => {
    localStorage.setItem(store._id + 'PINIA_STATE', JSON.stringify(state))
  })
})

app.use(pinia)

app.mount('#app')
