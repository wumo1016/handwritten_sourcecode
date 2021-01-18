export let Vue

function install(_Vue) {
  Vue = _Vue

  // Vue.prototype.$store // 如果有多个实例的话 没有引入store 的实例 也会被挂载$store
  Vue.mixin({
    beforeCreate() { // 获取根组件中传入的store 共享给其他组件
      const options = this.$options
      if(options.store){ // 根组件
        this.$store = options.store
      } else {
        if(this.$parent && this.$parent.$store){
          this.$store = this.$parent.$store
        }
      }
    }
  })
}

export default install