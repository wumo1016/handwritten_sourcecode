<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />

    <Level tag="h1">111111111</Level>
    <Level tag="h2">2222222222</Level>

    <MyMenu :data="tree" />
  </div>
</template>

<script>
import Level from '@/views/level'
import MyMenu from '@/views/menu/my-menu.jsx'
export default {
  components: { Level, MyMenu },
  data: function() {
    return {
      tree: [
        {
          title: '菜单1',
          children: [
            {
              title: '菜单1-1'
            }
          ]
        },
        {
          title: '菜单2',
          children: [
            {
              title: '菜单2-1',
              children: [
                {
                  title: '菜单2-1-1'
                }
              ]
            }
          ]
        },
        {
          title: '菜单3'
        }
      ]
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
