<template>
  <div>
    bar
    {{ $store.state.name }}
    <button @click="$store.dispatch('changeName', 123)">测试</button>
  </div>
</template>

<script>
export default {
  asyncData(store){ // 服务端返回页面之前会调用
    return store.dispatch('changeName', 'test')
  }
}
</script>

<style lang="scss" scoped>
</style>