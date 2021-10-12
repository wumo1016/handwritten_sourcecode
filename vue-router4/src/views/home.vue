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
  setup() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
</style>