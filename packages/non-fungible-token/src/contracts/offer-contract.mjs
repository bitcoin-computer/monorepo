export class Offer extends Contract {
  constructor(title, amount, recipient, swapTx) {
    super({
      title,
      amount,
      swapTx,
      _owners: [recipient],
      _url: 'http://127.0.0.1:1031'
    })
  }
}
