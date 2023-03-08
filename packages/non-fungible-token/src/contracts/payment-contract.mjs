export class Payment extends Contract {
  constructor(to, amount) {
    super({
      _owners: [to],
      _amount: amount,
    });
  }

  transfer(to) {
    this._owners = to
  }
}
