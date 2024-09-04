import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Computer } from '@bitcoin-computer/lib'
import styled from 'styled-components'
import Wallet from './Wallet'
import Login from './Login'
import MintToken from './MintToken'
import Card from './Card'
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

const getConf = () => ({
  chain: window.localStorage.getItem("CHAIN") || '',
  // the BIP_39_KEY is set on login and we fetch it from local storage
  mnemonic: window.localStorage.getItem("BIP_39_KEY"),
})

const App: React.FC = () => {
  // To connect the app to a local Bitcoin Computer node set "network" to "regtest"
  const [config] = useState(getConf())
  const [computer, setComputer] = useState<typeof Computer | null>(null)
  const [objects, setObjects] = useState<TokenType[]>([])

  useEffect(() => {
    const isLoggedIn = config.mnemonic && config.chain
    // if you are currently logging in
    if (isLoggedIn && !computer) {
      setComputer(new Computer(config))
      console.log(`Bitcoin Computer created on ${  config.chain}`)
      // if you are currently logging out
    } else if (!isLoggedIn && computer) {
      console.log('You have been logged out')
      setComputer(null)
    }
  }, [computer, config.chain, config])

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
        [obj._root]: (acc[obj._root] || []).concat(obj),
      }),
      {}
    )

  return (
    <Router>
      <Header>
        <MintToken computer={computer}></MintToken>
        <Wallet computer={computer} chain={config.chain}></Wallet>
        <Login 
          config={config}
          setComputer={setComputer}>
        </Login>
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
