<template>
  <div>home</div>
  <div>
    <router-link to="/a">a</router-link>
    <router-link to="/b">b</router-link>
  </div>
  <router-view></router-view>
</template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    console.log('beforeRouteEnter')
  },
  beforeRouteUpdate(to, from, next) {
    console.log('beforeRouteUpdate')
  },
  beforeRouteLeave(to, from, next) {
    console.log('beforeRouteLeave')
  }
}
</script>

<style lang="scss" scoped>
</style>