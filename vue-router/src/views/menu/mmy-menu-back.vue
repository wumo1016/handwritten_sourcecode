<template>
  <WuMenu>
    <template v-for="item in data">
      <ReSub :key="item.title" :data="item" />
    </template>
  </WuMenu>
</template>

<script>
import WuMenu from './wu-menu'
import ReSub from './re-sub'

export default {
  components: { WuMenu, ReSub },
  props: {
    data: Array
  }
}
</script>

<style lang="scss" scoped></style>
