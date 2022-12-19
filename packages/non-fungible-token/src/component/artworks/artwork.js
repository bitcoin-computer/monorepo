const { Contract } = require('@bitcoin-computer/lib')

export default class Artwork extends Contract {
  constructor(title, artist, url) {
    super()
    this.title = title
    this.artist = artist
    this.url = url
  }

  setOwner(owner) {
    this._owners = [owner]
  }
}
