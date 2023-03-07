const ejs = require('ejs')

const str = `
<div>
<% if (user) { %>
  <span><%= user.name %></span>
<% } else { %>
  <span>登录</span>
<% } %>
</div>
`

// 编译模板
let template = ejs.compile(str, {})

// 渲染模板，根据用户状态渲染不同的视图。
// const data = {
//   user: {
//     name: '张三'
//   }
// }
const data = { user: null }
console.log(template(data))
