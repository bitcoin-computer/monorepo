import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import InviteUser from './InviteUser'

function Chat({ computer }) {
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState({ messages: [] })
  const [refresh, setRefresh] = useState(null)

  const { rev } = useParams()

  useEffect(() => {
    const refreshChat = async () => {
      if (computer) {
        const [latestRev] = await computer.query({ ids: [rev] })
        setChat(await computer.sync(latestRev))
      }
    }
    refreshChat()
  }, [rev, computer, refresh])

  useEffect(() => {
    setTimeout(() => setRefresh(refresh + 1), 5000)
  }, [refresh])

  const send = async (e) => {
    e.preventDefault()
    const username = window.localStorage.getItem('USER_NAME')
    const line = `${username}: ${message}`
    try {
      await chat.post(line)
      // eslint-disable-next-line no-console
      console.log(`Sent message ${line}\n  chat id  ${chat._id}\n  chat rev ${chat._rev}`)
    } catch (error) {
      if (error.message.startsWith('Insufficient balance in address')) {
        // eslint-disable-next-line no-alert, no-undef
        alert('You have to fund your wallet')
      }
    }
    setMessage('')
  }

  return (
    <div>
      <InviteUser chat={chat}></InviteUser>
      <br />
      <textarea rows="12" cols="60" value={chat.messages.join('\n')} readOnly></textarea>
      <form onSubmit={send}>
        <input type="string" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default Chat
