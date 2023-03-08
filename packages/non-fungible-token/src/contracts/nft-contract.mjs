export class NFT extends Contract {
  constructor(title, artist, url, creator, royalty) {
    super({ title, artist, url, creator, royalty });
  }

  transfer(owner) {
    this._owners = [owner];
  }

  sell(payment) {
    const { _owners: tokenOwners } = this;
    const { _owners: paymentOwners } = payment;
    this._owners = paymentOwners;
    payment.transfer(tokenOwners);

    // eslint-disable-next-line no-undef
    return new Royalty(this.creator, this.royalty * payment._amount);
  }
}
