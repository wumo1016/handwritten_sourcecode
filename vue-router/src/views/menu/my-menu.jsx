import WuMenu from './wu-menu'
import WuSubmenu from './wu-submenu'
import WuMenuItem from './wu-menu-item'

export default {
  components: { WuMenu, WuSubmenu, WuMenuItem },
  props: {
    data: Array
  },
  render() {
    const renderChilren = data => {
      return data.map(child => {
        return !child.children ? (
          <WuMenuItem>{child.title}</WuMenuItem>
        ) : (
          <WuSubmenu>
            <div slot="title">{child.title}</div>
            {renderChilren(child.children)}
          </WuSubmenu>
        )
      })
    }
    return <WuMenu>{renderChilren(this.data)}</WuMenu>
  }
}
