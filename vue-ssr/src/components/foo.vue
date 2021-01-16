<template>
  <div @click="test">foo</div>
</template>

<script>
export default {
  methods: {
    test() {
      alert("foo");
    },
  },
};
</script>

<style scoped>
div {
  background: rgba(126, 124, 124, 0.671);
}
</style>>