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
    try {
      setCounter(await computer.new(Counter))
      console.log('Created counter smart object', counter)
      alert('Created counter smart object')
    } catch (err) {
      alert(err.message)
      console.log(`Error: ${err.message}`)
    }
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
      <button onClick={increment} disabled={!counter}>Increment</button>
      <p><b>{counter ? `Count: ${count}` : ''}</b></p>
      <p>{counter ? `Id: ${counter._id}` : ''}</p>
      <p>{counter ? `Revision: ${counter._rev}` : ''}</p>
    </div>
  )
}

export default Counter
