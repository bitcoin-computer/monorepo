import { useState } from "react"
import { Auth, UtilsContext } from "@bitcoin-computer/components"

function Counter() {
  const [computer] = useState(Auth.getComputer())
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  const [counter, setCounter] = useState<Counter | null>(null)
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

  const createSmart = async (evt: any) => {
    evt.preventDefault()
    showLoader(true)
    try {
      setCounter(await computer.new(Counter))
      showSnackBar("Created counter smart object", true)
    } catch (err: any) {
      showSnackBar(err && err.message ? err.message : "Error occurred", false)
    } finally {
      showLoader(false)
    }
  }

  const increment = async (evt: any) => {
    evt.preventDefault()
    try {
      showLoader(false)
      if (!counter) {
        showSnackBar("smart counter not present", false)
        return
      }
      await counter.inc()
      setCount(counter.n)
    } catch (err: any) {
      showSnackBar(err && err.message ? err.message : "Error occurred", false)
    } finally {
      showLoader(false)
    }
  }

  return (
    <>
      <div className="p-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-slate-500"
          onClick={(evt) => createSmart(evt)}
          disabled={!!counter}
        >
          Create Smart Object
        </button>
        <br />
        <br />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-slate-500"
          onClick={(evt) => increment(evt)}
          hidden={!counter}
        >
          Increment
        </button>
        <p>
          <b>{counter ? `Count: ${count}` : ""}</b>
        </p>
        <p>{counter ? `Id: ${counter._id}` : ""}</p>
        <p>{counter ? `Revision: ${counter._rev}` : ""}</p>
      </div>
    </>
  )
}

export default Counter
