export class Offer extends Contract {
  constructor(tx, recipient, url) {
    super({
      tx,
      _owners: [recipient],
      _url: url
    })
  }
}
