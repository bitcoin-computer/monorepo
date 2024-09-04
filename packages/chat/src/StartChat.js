import React from 'react'
import { useNavigate } from 'react-router-dom'
import ChatSc from './chat-sc'

function StartChat({ computer }) {
  const navigate = useNavigate()

  const createChat = async (e) => {
    try {
      e.preventDefault()
      const publicKey = computer.getPublicKey()
      // eslint-disable-next-line no-console
      console.log('creating chat')
      let chat
      try {
        if ((await computer.getBalance()).balance < 100) {
          await computer.faucet(1e7)
        }
        chat = await computer.new(ChatSc, [publicKey])
      } catch (err) {
        if (err.message.startsWith('Insufficient balance in address'))
          // eslint-disable-next-line no-alert, no-undef
          alert('You have to fund your wallet')
      }
      // eslint-disable-next-line no-console
      console.log('created chat', chat)
      navigate(`/chat/${chat._id}`)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('error creating chat', err)
    }
  }
  return (
    <div>
      <button onClick={createChat}>Create Chat</button>
    </div>
  )
}

export default StartChat
