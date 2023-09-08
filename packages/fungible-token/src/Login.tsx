import React, { useState } from 'react'
import useInterval from './useInterval'
import styled from 'styled-components'
import { Computer } from "@bitcoin-computer/lib"

const LoginScreen = styled.div`
  height: 100%;
  width: 100%;
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
`
export interface ILoginProps {
  config: any
  setComputer: (computer: typeof Computer) => void
}

const Login: React.FC<ILoginProps> = (props) => {
  const { config, setComputer } = props
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [chain, setChain] = useState('LTC')

  useInterval(() => {
    if (window.localStorage.getItem('BIP_39_KEY')) {
      setLoggedIn(true)
    }
  }, 1000)

  const login = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!password) return
    window.localStorage.setItem('BIP_39_KEY', password)
    window.localStorage.setItem('CHAIN', chain)
    const computer = new Computer({
      ...config,
      chain: chain,
      mnemonic: localStorage.getItem("BIP_39_KEY"),
    })
    setComputer(computer)
    setLoggedIn(true)
  }

  const logout = (e: React.SyntheticEvent) => {
    e.preventDefault()
    window.localStorage.removeItem('BIP_39_KEY')
    window.localStorage.removeItem('USER_NAME')
    window.localStorage.removeItem('CHAIN')
    setLoggedIn(false)
  }

  return loggedIn ? (
    <>
      <button onClick={logout}>Logout</button>
    </>
  ) : (
    <LoginScreen>
      <div id="">
        <div className="module center padding-left-24">
          <h2 className="margin-auto">Bitcoin Token</h2>
          <p>Don&apos;t forget to write down your seed.</p>
          <small>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://iancoleman.io/bip39/"
            >
              Generate BIP39 Seed
            </a>
          </small>
          <br />
          <form onSubmit={login}>
            <input
              className="textbox"
              placeholder="Password (BIP39 Seed)"
              type="string"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select
              value={chain}
              onChange={(e) => {
                setChain(e.target.value)
              }}
              id="chain"
            >
              <option value="LTC">LTC testnet</option>
            </select>
            <button type="submit" className="button">
              Login
            </button>
          </form>
        </div>
      </div>
    </LoginScreen>
  )
}

export default Login
