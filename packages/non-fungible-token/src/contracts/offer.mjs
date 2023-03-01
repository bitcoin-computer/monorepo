export class Offer extends Contract {
  constructor(tx, recipient) {
    super({
      tx,
      _owners: [recipient],
      _url: 'http://127.0.0.1:3000'
    })
  }
}
