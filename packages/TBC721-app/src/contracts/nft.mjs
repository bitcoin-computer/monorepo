export class NFT extends Contract {
  constructor(title, artist, url, creator, royalty) {
    super({ title, artist, url, creator, royalty });
  }

  transfer(owner) {
    this._owners = [owner];
  }

  sell(p) {
    const { _owners: ownersToken } = this;
    const { _owners: ownersPayment } = p;
    this._owners = ownersPayment;
    p.transfer(ownersToken);

    // eslint-disable-next-line no-undef
    return new Royalty(this.creator, this.royalty * p._amount);
  }
}
