import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Computer } from '@bitcoin-computer/lib'
import Wallet from './Wallet'
import Chat from './Chat'
import SideBar from './SideBar'
import useInterval from './useInterval'

/**
 * This is a simple chat app that demonstrates how to use the @bitcoin-computer/lib.
 */
function App() {
  const getConf = () => ({
    chain: window.localStorage.getItem('CHAIN'),
    // the BIP_39_KEY is set on login and we fetch it from local storage
    mnemonic: window.localStorage.getItem('BIP_39_KEY')
  })

  // To connect the app to a local Bitcoin Computer node set "network" to "regtest"
  const [config] = useState(getConf())
  const [computer, setComputer] = useState(null)
  const [chats, setChats] = useState([])

  useInterval(() => {
    const isLoggedIn = config.mnemonic && config.chain

    // if you are currently logging in
    if (isLoggedIn && !computer) {
      setComputer(new Computer(config))
      // eslint-disable-next-line no-console
      console.log(`Bitcoin Computer created on chain ${  config.chain}`)
      // if you are currently logging out
    } else if (!isLoggedIn && computer) {
      // eslint-disable-next-line no-console
      console.log('You have been logged out')
      setComputer(null)
    }
  }, 5000)

  useInterval(() => {
    const refresh = async () => {
      if (computer) {
        const revs = await computer.query({ publicKey: computer.getPublicKey() })
        setChats(await Promise.all(revs.map(async (rev) => computer.sync(rev))))
      }
    }
    refresh()
  }, 7000)

  return (
    <Router>
      <div className="App">
        {/* bind the value of chain stored in the state to the child component */}
        <Wallet computer={computer} chain={config.chain}></Wallet>
        <SideBar computer={computer} chats={chats}></SideBar>

        <div className="main">
          <Routes>
            <Route path="/chat/:rev" element={<Chat computer={computer}></Chat>} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
