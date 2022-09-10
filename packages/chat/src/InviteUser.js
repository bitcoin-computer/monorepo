import React from 'react'

function InviteUser({ chat }) {
  const inviteUser = async (e) => {
    try {
      e.preventDefault()
      const publicKey = prompt('Enter the public key of a friend and send them the url.')
      await chat.invite(publicKey)
    } catch (err) {
      console.log(err)
    }
  }
  return <div><button onClick={inviteUser}>Invite User</button></div>
}

export default InviteUser
