import React from 'react'

function InviteUser({ chat }) {
  const inviteUser = async (e) => {
    try {
      e.preventDefault()
      // eslint-disable-next-line no-alert, no-undef
      const publicKey = prompt('Enter the public key of a friend and send them the url.')
      await chat.invite(publicKey)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }
  return (
    <div>
      <button onClick={inviteUser}>Invite User</button>
    </div>
  )
}

export default InviteUser
