/*
// 示例1-基础
import { createRoot } from 'react-dom/client'

const element = (
  <h1>
    hello
    <span style={{ color: 'red' }}>world</span>
  </h1>
)

const root = createRoot(document.getElementById('root'))
root.render(element)
*/

/* 
// 示例2-函数组件
import { createRoot } from 'react-dom/client'
function FunctionComponent() {
  return (
    <h1>
      hello
      <span style={{ color: 'red' }}>world</span>
    </h1>
  )
}
const element = <FunctionComponent /> // 等价于 React.createElement(FunctionComponent)
const root = createRoot(document.getElementById('root'))
root.render(element)
*/

// 示例3-事件
import { createRoot } from 'react-dom/client'
function FunctionComponent() {
  return (
    <h1
      onClick={() => console.log(`父冒泡`)}
      onClickCapture={() => console.log(`父捕获`)}
    >
      hello
      <span
        onClick={() => console.log(`子冒泡`)}
        onClickCapture={() => console.log(`子捕获`)}
        style={{ color: 'red' }}
      >
        world
      </span>
    </h1>
  )
}
const element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element)
