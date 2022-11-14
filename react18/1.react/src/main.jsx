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
/* 
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
      <li key="B">B1</li>
      <li key="C">C1</li>
      <li key="D">D1</li>
    </ul>
  )
}

const element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element)
 */
/* 
// 示例6-多节点diff2
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
      <li key="B">B1</li>
    </ul>
  )
}

const element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element) */
/* 
// 示例6-多节点diff2
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  const [number, setNumber] = React.useState(0)
  return number === 0 ? (
    <ul onClick={() => setNumber(number + 1)}>
      <li key="A">A</li>
      <li key="B">B</li>
      <li key="C">C</li>
      <li key="D">D</li>
      <li key="E">E</li>
      <li key="F">F</li>
    </ul>
  ) : (
    <ul>
      <li key="A">A</li>
      <li key="C">C</li>
      <li key="E">E</li>
      <li key="B">B</li>
      <li key="G">G</li>
      <li key="D">D</li>
    </ul>
  )
}

const element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element) */
/* 
// 示例6-useEffect
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  const [number, setNumber] = React.useState(0)
  React.useEffect(() => {
    console.log('useEffect1')
    return () => {
      console.log('destroy useEffect1')
    }
  })
  React.useEffect(() => {
    console.log('useEffect2')
    return () => {
      console.log('destroy useEffect2')
    }
  })
  React.useEffect(() => {
    console.log('useEffect3')
    return () => {
      console.log('destroy useEffect3')
    }
  })
  return <button onClick={() => setNumber(number + 1)}>{number}</button>
}

const element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element)
 */
/* 
// 示例6-useLayoutEffect
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  const [number, setNumber] = React.useState(0)
  React.useEffect(() => {
    console.log('useEffect1')
    return () => {
      console.log('destroy useEffect1')
    }
  })
  React.useLayoutEffect(() => {
    console.log('useLayoutEffect1')
    return () => {
      console.log('destroy useLayoutEffect1')
    }
  })
  React.useEffect(() => {
    console.log('useEffect2')
    return () => {
      console.log('destroy useEffect2')
    }
  })
  return <button onClick={() => setNumber(number + 1)}>{number}</button>
}

const element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element)
 */
/* 
// 同步渲染
import * as React from 'react';
import { createRoot } from "react-dom/client";

let element = <h1 >hello</h1>
const root = createRoot(document.getElementById("root"));
root.render(element); 
*/

/* 
// 微任务同步渲染
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  const [number, setNumber] = React.useState(0)
  return <button onClick={() => {
    setNumber(number => number + 1)
    setNumber(number => number + 2)
  }}>{number}</button>
}
let element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element) */

/* 
// 微任务同步并发渲染
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  const [number, setNumber] = React.useState(0)
  React.useEffect(() => {
    setNumber(number + 1)
  }, [])
  return <button onClick={() => setNumber(number + 1)}>{number}</button>
}
let element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element) */
/* 
// 高优先级打断低优先级  ABCABCABCABCABCABCABCABCABCABCABC => ACBACBACBACBACBACBACBACBACBACB
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  console.log('FunctionComponent')
  const [numbers, setNumbers] = React.useState(new Array(10).fill('A'))
  React.useEffect(() => {
    setNumbers((numbers) => numbers.map((number) => number + 'B'))
  }, [])
  return (
    <button
      onClick={() => {
        setNumbers((numbers) => numbers.map((number) => number + 'C'))
      }}
    >
      {numbers.map((number, index) => (
        <span key={index}>{number}</span>
      ))}
    </button>
  )
}
let element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element) */
/* 
// 示例-useRef
import * as React from 'react'
import { createRoot } from 'react-dom/client'

function FunctionComponent() {
  console.log('FunctionComponent')
  const [number, setNumber] = React.useState(0)
  const buttonRef = React.useRef()
  React.useEffect(() => {
    console.log(buttonRef.current)
  }, [])
  return (
    <button
      ref={buttonRef}
      // ref={(buttonDom) => (buttonDom.style.color = 'red')}
      onClick={() => {
        setNumber((number) => number + 1)
      }}
    >
      {number}
    </button>
  )
}
let element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element)
 */

// 示例: 饥饿问题
import * as React from 'react'
import { createRoot } from 'react-dom/client'

let counter = 0
let timer
let bCounter = 0
let cCounter = 0
function FunctionComponent() {
  const [numbers, setNumbers] = React.useState(new Array(100).fill('A'))
  const divRef = React.useRef()

  const updateB = (numbers) => new Array(100).fill(numbers[0] + 'B')
  updateB.id = 'updateB' + bCounter++

  const updateC = (numbers) => new Array(100).fill(numbers[0] + 'C')
  updateC.id = 'updateC' + cCounter++

  React.useEffect(() => {
    timer = setInterval(() => {
      divRef.current.click() // 1
      // 第一次走
      if (counter++ === 0) {
        setNumbers(updateB) // 16
      }
      divRef.current.click() // 1
      if (counter++ > 100) {
        clearInterval(timer)
      }
    })
  }, [])

  return (
    <div
      ref={divRef}
      onClick={() => {
        setNumbers(updateC)
      }}
    >
      {numbers.map((number, index) => (
        <span key={index}>{number}</span>
      ))}
    </div>
  )
}
let element = <FunctionComponent />
const root = createRoot(document.getElementById('root'))
root.render(element)
 