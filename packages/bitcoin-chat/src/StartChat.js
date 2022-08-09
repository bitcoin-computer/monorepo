import React from 'react'
import { useHistory } from 'react-router-dom'
import Utils from './utils'

function StartChat({ computer }) {
  const history = useHistory()

  const createChat = async (e) => {
    try {
      e.preventDefault()
      const publicKey = computer.db.wallet.getPublicKey().toString()
      const ChatSc= await Utils.importFromPublic('/chat-sc.js')
      const chat = await computer.new(ChatSc, [publicKey])
      history.push(`/chat/${chat._id}`)
    } catch (err) {
      if(err.message.startsWith('Insufficient balance in address'))
        alert('You have to fund your wallet https://faucet.bitcoincloud.net/')
    }

  }
  return <div><button onClick={createChat}>Create Chat</button></div>
}

export default StartChat
