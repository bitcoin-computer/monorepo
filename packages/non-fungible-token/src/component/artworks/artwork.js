// eslint-disable-next-line no-undef
export default class Artwork extends Contract {
  constructor(title, artist, url) {
    super({ title, artist, url})
  }

  setOwner(owner) {
    this._owners = [owner]
  }
}
