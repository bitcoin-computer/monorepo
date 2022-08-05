import React, { useState, useEffect } from 'react'
import { Computer } from 'bitcoin-computer-lib'
import './App.css'

function App() {
  const [computer] = useState(new Computer({
    seed: 'travel upgrade inside soda birth essence junk merit never twenty system opinion',
    chain: 'LTC'
  }))
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState(0)
  const [to, setTo] = useState('')

  useEffect(() => {
   async function refresh() {
      if(computer)
        setBalance(await computer.db.wallet.getBalance())
    }
    refresh()
  }, [computer])

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    const txId = await computer.db.wallet.send(parseInt(amount * 1e8, 10), to)
    const message = `Sent\n${amount}\n\nTo\n${to}\n\nTransaction id\n${txId}`
    console.log(message)
    alert(message)
  }

  return (
    <div className="App">
      <h2>Wallet</h2>
      <b>Address</b>&nbsp;{computer.db.wallet.getAddress().toString()}<br />
      <b>Public Key</b>&nbsp;{computer.db.wallet.getPublicKey().toString()}<br />
      <b>Balance</b>&nbsp;{balance/1e8} {computer.db.wallet.restClient.chain}

      <h3>Send</h3>
      <form onSubmit={handleSubmit}>
        <div className='row'>
          <div className='col-25'>
            <label>
              Amount&nbsp;
            </label><br />
          </div>
          <div class="col-75">
            <input type="number" value={amount} min="0.00" step="0.001" presicion={2} onChange={e => setAmount(e.target.value)}>
            </input>   
          </div>
        </div>
        <div className='row'>
          <div className='col-25'>
            <label>
              To&nbsp;
            </label><br />
          </div>
          <div class="col-75">
            <input type="string" style={{ width: "300px" }} value={to} onChange={e => setTo(e.target.value)}>
            </input>
          </div>  
        </div>
        <div className='row'>
          <input type="submit" value="Send Bitcoin"></input>
        </div>
      </form>
    </div>
  )
}

export default App
