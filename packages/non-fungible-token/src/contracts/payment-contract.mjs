export class Payment extends Contract {
  constructor(to, amount, nftRev) {
    super({
      _owners: [to],
      _amount: amount,
      nftRev: nftRev
    });
  }

  transfer(to) {
    this._owners = [to]
  }
}
