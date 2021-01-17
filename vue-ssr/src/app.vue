<template>
  <div id="app">
    <Foo />
    <Bar />
  </div>
</template>

<script>
import Foo from './components/foo.vue'
import Bar from './components/bar.vue'
export default {
  components: {
    Foo,
    Bar
  }
};
</script>

<style lang="scss" scoped>
</style>