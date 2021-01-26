export default {
  props: {
    tag: {
      type: String,
      required: true
    }
  },
  render(h) {
    return h(this.tag, this.$slots.default)
  }
}
