import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Computer } from '@bitcoin-computer/lib'
import Wallet from './Wallet'
import Login from './Login'
import MintToken from './MintToken'
import Card from './Card'
import styled from 'styled-components'
import { TokenType } from './types'

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

/**
 * To run the tests with a local Bitcoin Computer node set "network" to "regtest" and
 * "url" to "http://127.0.0.1:3000" in the "opts" object below.
 */
const opts = {
  mnemonic:
    'athlete penalty eyebrow hurry actual hope body unfair trouble skin manual fold limb kid fox',
  chain: 'LTC',
  url: 'https://node.bitcoincomputer.io',
  network: 'testnet',
}

const App: React.FC = () => {
  const [computer, setComputer] = useState<typeof Computer | null>(null)
  const [objects, setObjects] = useState<TokenType[]>([])
  const [chain, setChain] = useState('LTC')

  useEffect(() => {
    // BIP_39_KEY & CHAIN is set on login and we fetch it from local storage
    const mnemonic = window.localStorage.getItem('BIP_39_KEY')
    setChain(window.localStorage.getItem('CHAIN') || '')

    const isLoggedIn = mnemonic && chain
    // if you are currently logging in
    if (isLoggedIn && !computer) {
      setComputer(new Computer({ ...opts, mnemonic, chain }))
      console.log('Bitcoin Computer created on ' + chain)
      // if you are currently logging out
    } else if (!isLoggedIn && computer) {
      console.log('You have been logged out')
      setComputer(null)
    }
  }, [computer, chain])

  useEffect(() => {
    const refresh = async () => {
      if (computer !== null) {
        // Get all revisions created with the Token contract and the current wallet public key
        const revs = await computer.query({
          publicKey: computer.getPublicKey()
        })
        setObjects(await Promise.all(revs.map(async (rev: string) => computer.sync(rev))))
      }
    }
    refresh()
  }, [computer])

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
