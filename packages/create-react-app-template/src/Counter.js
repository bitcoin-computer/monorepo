import { useState } from "react"

function Counter({ computer }) {
  const [counter, setCounter] = useState(null)
  // eslint-disable-next-line no-undef
  class Counter extends Contract {
    constructor() {
      super({ n: 0 })
    }

    inc() {
      this.n += 1
    }
  }

  const [count, setCount] = useState(0)

  const createSmart = async (evt) => {
    evt.preventDefault()
    const counter = await computer.new(Counter)
    setCounter(counter)
    setCount(counter.n)
    console.log('Created smart object', counter)
    alert("Created smart counter. Now you can increment it.")
  }

  const increment = async (evt) => {
    evt.preventDefault()
    if (!counter) {
      alert("Please create a smart object first")
      return
    }
    await counter.inc()
    setCount(counter.n)
    console.log('Updated smart object', counter)
  }
  return (
    <div>
      <button onClick={createSmart}>Create Smart Object</button>
      <br /><br />
      <button onClick={increment}>Increment</button>
      <p>counter is {count}</p>
    </div>
  )
}

export default Counter
