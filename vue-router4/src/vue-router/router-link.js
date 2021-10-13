import { h } from 'vue'

function useLink() {
  function navigate(e) {
    console.log('跳转')
  }
  return navigate
}

export const RouterLink = {
  name: 'RouterLink',
  props: {
    to: {
      type: [String, Object],
      required: true
    }
  },
  setup(props, { slots }) {
    const link = useLink()
    return () => {
      return h(
        'a',
        {
          onClick: link.navigate
        },
        slots.default && slots.default()
      )
    }
  }
}
