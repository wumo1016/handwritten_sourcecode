export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  render() {
    const go = () => {
      this.$router.push(this.to)
    }
    return <a onClick={go}>{this.$slots.default}</a>
  }
}

/* 
// 不能用函数式组件，因为需要拿到 this.$router
// 当然也可以通过 ctx.parent.$router 拿到
export default {
  // 函数式组件 render中没有this
  // 就是无状态组件(没有data)
  functional: true,
  props: {
    to: {
      type: String,
      required: true
    }
  },
  render(h, { props, slots }) {
    const go = () => {
      console.log(props.to)
    }
    return <a onClick={go}>{slots().default}</a>
  }
}
*/
