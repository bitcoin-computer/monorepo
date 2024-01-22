import { Computer } from "@bitcoin-computer/lib"
import { useState } from "react"
import Loader from "./Loader"
import SnackBar from "./SnackBar"

function Counter(props: { computer: Computer }) {
  const { computer } = props
  console.log(computer)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")

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
    setLoading(true)
    try {
      setCounter(await computer.new(Counter))
      setLoading(false)
      setMessage("Created counter smart object")
      setSuccess(true)
      setShow(true)
    } catch (err: any) {
      setLoading(false)
      setMessage(err.message)
      setSuccess(false)
      setShow(true)
    }
  }

  const increment = async (evt: any) => {
    evt.preventDefault()
    if (!counter) {
      setMessage("smart counter not present")
      setSuccess(false)
      setShow(true)
      return
    }
    await counter.inc()
    setCount(counter.n)
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
        {show && <SnackBar message={message} success={success} setShow={setShow} />}
        {loading && <Loader />}
      </div>
    </>
  )
}

export default Counter
