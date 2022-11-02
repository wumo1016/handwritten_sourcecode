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

/* 
// 示例3-事件
import { createRoot } from 'react-dom/client'
function FunctionComponent() {
  return (
    <h1
      onClick={(e) => console.log(`父冒泡`, e.currentTarget)}
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
 */
/* 
// 示例4-useReducer
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  const [number, setNumber] = React.useReducer((state, action) => {
    if (action.type === 'add') return state + 1
    return state
  }, 0)

  let attrs = {
    id: Date.now()
  }
  if (number == 2) {
    delete attrs.id
    attrs.style = { color: 'red' }
  }

  return (
    <button
      {...attrs}
      onClick={() => {
        setNumber({
          type: 'add'
        })
        setNumber({
          type: 'add'
        })
      }}
    >
      {number}
    </button>
  )
}

const element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element) */
/* 
// 示例5-useState
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  const [number, setNumber] = React.useState(0)
  // 如果setNumber传入的值和当前的一样 不需要更新
  return (
    <button
      onClick={() => {
        // setNumber(number + 1)

        // setNumber(number)
        // setNumber(number + 1)
        // setNumber(number + 2)

        setNumber((value) => value + 2)
      }}
    >
      {number}
    </button>
  )
}

const element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element) */
/* 
// 示例5-单节点diff key不一样，type一样
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  const [number, setNumber] = React.useState(0)
  return number === 0 ? (
    <div
      key="title1"
      onClick={() => {
        setNumber(number + 1)
      }}
    >
      title1
    </div>
  ) : (
    <div
      key="title2"
      onClick={() => {
        setNumber(number + 1)
      }}
    >
      title2
    </div>
  )
}

const element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element) */

// 示例5-多节点diff1
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  const [number, setNumber] = React.useState(0)
  return number === 0 ? (
    <ul onClick={() => setNumber(number + 1)}>
      <li key="A">A</li>
      <li key="B">B</li>
      <li key="C">C</li>
    </ul>
  ) : (
    <ul>
      <li key="A">A1</li>
      <li key="B">B</li>
      <li key="C">C1</li>
    </ul>
  )
}

const element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element)
