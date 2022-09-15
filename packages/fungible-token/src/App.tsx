import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Computer } from '@bitcoin-computer/lib'
import Wallet from './Wallet'
import Login from './Login'
import MintToken from './MintToken'
import Card from './Card'
import useInterval from './useInterval'
import styled from 'styled-components'
import { TokenType } from './types'
import Token from './token-sc'

const Flex = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const Header = styled.div`
  display: flex;
  justify-content: left;
  & > button {
    margin: 5px;
  }
`

const App: React.FC = () => {
  const [computer, setComputer] = useState<typeof Computer | null>(null)
  const [objects, setObjects] = useState<TokenType[]>([])
  const [chain, setChain] = useState('LTC')

  useInterval(() => {
    // BIP_39_KEY & CHAIN is set on login and we fetch it from local storage
    const password = window.localStorage.getItem('BIP_39_KEY')
    setChain(window.localStorage.getItem('CHAIN') || '')

    const isLoggedIn = password && chain
    // if you are currently logging in
    if (isLoggedIn && !computer) {
      setComputer(
        new Computer({
          mnemonic: password,
          chain: 'LTC',
          url: 'https://node.bitcoincomputer.io',
          network: 'testnet',

          // To run locally on regtest, uncomment the following lines:
          // url: 'http://127.0.0.1:3000',
          // network: 'regtest',
        })
      )
      console.log('Bitcoin Computer created on ' + chain)
      // if you are currently logging out
    } else if (!isLoggedIn && computer) {
      console.log('You have been logged out')
      setComputer(null)
    }
  }, 20000)

  useInterval(() => {
    const refresh = async () => {
      if (computer !== null) {
        // Get all revisions created with the Token contract and the current wallet public key
        const revs = await computer.query({contract: Token, publicKey: computer.getPublicKey()})
        setObjects(await Promise.all(revs.map(async (rev: string) => computer.sync(rev))))
      }
    }
    refresh()
  }, 20000)

  // todo: refactor this function
  const groupByRoot = (list: TokenType[]) =>
    list.reduce(
      (acc, obj) => ({
        ...acc,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        [obj['_root']]: (acc[obj['_root']] || []).concat(obj),
      }),
      {}
    )

  return (
    <Router>
      <Header>
        <MintToken computer={computer}></MintToken>
        <Wallet computer={computer} chain={chain}></Wallet>
        <Login></Login>
      </Header>
      <Flex>
        {Object.values(groupByRoot(objects)).map((tokens) => (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <Card key={tokens[0]._id} tokens={tokens}></Card>
        ))}
      </Flex>
    </Router>
  )
}

export default App
