import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from './use-pinia'
const pinia = createPinia()

createApp(App).use(pinia).mount('#app')
