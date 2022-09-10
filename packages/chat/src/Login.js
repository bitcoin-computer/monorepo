import React, { useState } from 'react'
import useInterval from './useInterval'

function Login() {
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [chain, setChain] = useState('LTC')

  useInterval(() => {
    setLoggedIn(!!window.localStorage.getItem('BIP_39_KEY'))
  }, 500)

  const login = (e) => {
    e.preventDefault()
    window.localStorage.setItem('BIP_39_KEY', password)
    window.localStorage.setItem('USER_NAME', username)
    window.localStorage.setItem('CHAIN', chain)
  }

  const logout = (e) => {
    window.localStorage.removeItem('BIP_39_KEY')
    window.localStorage.removeItem('USER_NAME')
    window.localStorage.removeItem('CHAIN')
  }

  return loggedIn
    ? <><button onClick={logout}>
        Logout
      </button><br /></>
    : <div className='login-screen'>
        <div id="">
          <div className="module center padding-left-24">
            <h2 className="margin-auto"> Chat - By Bitcoin Computer </h2>
            <form onSubmit={login}>
            <select value={chain} onChange={(e) => { setChain(e.target.value) }} id="chain">
              <option value="LTC">LTC</option>
            </select><br />
            <input className="textbox" placeholder='User Name (anything)' type="string" value={username} onChange={(e) => setUsername(e.target.value)} /><br />
            <input className="textbox" placeholder='Password (BIP39 Generated Seed Phrase)' type="string" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
            <button type="submit" className="button">Login</button>

          </form>
          <div> Need A Seed (Password?) <a _target="blank" href='https://iancoleman.io/bip39/'>Click Here</a></div>
          </div>
        </div>
      </div>
}

export default Login
