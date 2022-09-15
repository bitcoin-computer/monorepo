import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { TokenType } from './types'

export interface ISendTokenProps {
  tokens: TokenType[]
}

const SendToken: React.FC<ISendTokenProps> = ({ tokens }) => {
  const [amountString, setAmountString] = useState('')
  const [to, setTo] = useState('')

  const send = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    const balance = tokens.reduce(
      (acc, token) => acc + parseInt(token.coins, 10),
      0
    )
    const amount = parseInt(amountString)
    if (amount > balance) throw new Error('Insufficient Funds')

    tokens.sort((a, b) => parseInt(a.coins, 10) - parseInt(b.coins, 10))
    const newTokens: TokenType[] = []
    let leftToSpend = amount
    for (const token of tokens) {
      const tokenCoins = parseInt(token.coins, 10)
      if (0 < leftToSpend && 0 < tokenCoins) {
        newTokens.push(await token.send(Math.min(leftToSpend, tokenCoins), to))
        leftToSpend -= tokenCoins
      }
    }
    alert(`Sent tokens\n ${ 
      newTokens
        .map((token) => `${token.coins} -> ${token._owners[0]}`)
        .join('\n')}`)

    console.log(
      'Sent tokens\n',
      newTokens
        .map((token) => `${token.coins} -> ${token._owners[0]}`)
        .join('\n')
    )
  }

  return (
    <>
      <form onSubmit={send}>
        Amount
        <br />
        <input
          type="string"
          value={amountString}
          onChange={(e) => setAmountString(e.target.value)}
        />
        <br />
        To
        <br />
        <input
          type="string"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <br />
        <button type="submit">Send</button>
      </form>
    </>
  )
}

SendToken.propTypes = {
  tokens: PropTypes.array.isRequired,
}

export default SendToken
