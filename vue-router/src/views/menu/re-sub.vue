<template>
  <WuMenuItem v-if="!data.children">
    {{ data.title }}
  </WuMenuItem>
  <WuSubmenu v-else>
    <template #title>{{ data.title }}</template>
    <template v-for="v in data.children">
      <resub :key="v.title" :data="v" />
    </template>
  </WuSubmenu>
</template>

<script>
import WuSubmenu from './wu-submenu'
import WuMenuItem from './wu-menu-item'
export default {
  components: { WuSubmenu, WuMenuItem },
  name: 'resub',
  props: {
    data: {}
  }
}
</script>

<style lang="scss" scoped></style>
