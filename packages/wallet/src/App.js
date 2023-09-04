import React, { useState, useEffect } from "react"
import { Computer } from "@bitcoin-computer/lib"

function App() {
  const opts = {
    mnemonic:
      "travel upgrade inside soda birth essence junk merit never twenty system opinion",
    chain: "LTC",
    network: "regtest",
    url: "http://127.0.0.1:3000",
  }

  /**
   * To run the tests with the Bitcoin Computer testnet node remove the opts argument.
   */
  const [computer] = useState(new Computer(opts))
  const [balance, setBalance] = useState(null)
  const [amount, setAmount] = useState(0)
  const [to, setTo] = useState("")

  useEffect(() => {
    async function refresh() {
      if (computer) setBalance(await computer.getBalance())
    }
    refresh()
  }, [computer])

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    const txId = await computer.send(parseInt(amount * 1e8, 10), to)
    const message = `Sent\n${amount}\n\nTo\n${to}\n\nTransaction id\n${txId}`
    console.log(message)
    alert(message)
    window.location.reload()
  }

  const Balance = () => {
    if(balance === null) return <code>Loading...</code>
    return <code>{balance / 1e8} {computer.getChain()} ({computer.getNetwork()})</code>
  }

  return (
    <div className="App">
      <h1>Wallet</h1>

      <div className="row">
        <div className="col-25">Address</div>
        <div className="col-75"><code>{computer.getAddress()}</code></div>
      </div>
      <div className="row">
        <div className="col-25">Public Key</div>
        <div className="col-75"><code>{computer.getPublicKey()}</code></div>
      </div>

      <div className="row">
        <div className="col-25">Balance</div>
        <div className="col-75"><Balance /></div>
      </div>

      <h2>Send</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-25">
            <label>Amount</label>
            <br />
          </div>
          <div className="col-75">
            <input
              type="number"
              value={amount}
              min="0.00"
              step="0.001"
              onChange={(e) => setAmount(e.target.value)}
            ></input>
          </div>
        </div>
        <div className="row">
          <div className="col-25">
            <label>To</label>
            <br />
          </div>
          <div className="col-75">
            <input
              type="string"
              style={{ width: "300px" }}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            ></input>
          </div>
        </div>
        <div className="row">
          <div className="col-25">&nbsp;</div>
          <div className="col-75">
            <button type="submit">Send</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default App
