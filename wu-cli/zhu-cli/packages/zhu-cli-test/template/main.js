<% if (rootOptions.vueVersion === '3') { %>
    import { createApp } from 'vue'
    import App from './App.vue'
    createApp(App).mount('#app')
  <% } else { %>
    import Vue from 'vue'
    import App from './App.vue'
    Vue.config.productionTip = false
    new Vue({
      render: h => h(App),
    }).$mount('#app')
  <% } %>