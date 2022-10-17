export default class Artwork {
  constructor(title, artist, url) {
    this.title = title
    this.artist = artist
    this.url = url
  }

  setOwner(owner) {
    this._owners = [owner]
  }
}
