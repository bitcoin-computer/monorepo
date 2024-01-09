---
order: 0
visibility: hidden
---

# Examples

## Non-Fungible Tokens (NFTs)

A non-fungible token is an object that stores an image url, the title of an artwork, and the name of a artist.

A keyword property ``_owners`` is set to a public key. The holder of that public key is the owner of the object in the sense that the corresponding private key is required to update the object. To send the NFT to another user, the current owner can reassign the ``_owners`` property to the new owner's public key.


```javascript
class NFT {
  constructor(url, title, artist, owner) {
    this.url = url
    this.title = title
    this.artist = artist
    this._owners = [to]
  }

  send(to) {
    this._owners = [to]
  }
}
```

You can find a working implementation for minting, storing, and sending NFTs on [Github](https://github.com/bitcoin-computer/monorepo/tree/main/packages/non-fungible-token).

## Fungible Tokens

A fungible token is initialized to a fixed supply and an initial owner.

The only function is a ``send`` function. This function checks if the supply of the token is above the amount to be sent. If so, the amount stored in this instance is decreased by ```amount```. Then, a new instance of the token class is created. The owner of the new token is set to the recipient.


``` javascript
class Token {
  constructor(supply, to) {
    this.tokens = supply
    this._owners = [to]
  }

  send(amount, to) {
    if(this.tokens < amount) throw new Error()
    this.tokens -= amount
    return new Token(amount, to)
  }
}
```

See [Github](https://github.com/bitcoin-computer/monorepo/tree/main/packages/fungible-token) for more information.

## Chat

A chat is an object that stores a list of messages that is initially empty. It has a function ```invite``` that adds another user to the ``_owners`` array thereby giving them write access. (Only the creator of the chat can post and invite users initially.) Once invited, a user can call ```post``` function to send a message to the chat and invite other users.


```javascript
class Chat {
  constructor() {
    this.messages = []
  }

  invite(pubKey) {
    this._owners.push(pubKey)
  }

  post(messages) {
    this.messages.push(message)
  }
}
```

Try it out on [Github](https://github.com/bitcoin-computer/monorepo/tree/main/packages/chat).
