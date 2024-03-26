const { Contract } = await import('@bitcoin-computer/lib');
export class Swappable extends Contract {
    constructor(name = '', symbol = '') {
        super({ name, symbol });
    }
    transfer(to) {
        this._owners = [to];
    }
    swap(that) {
        const [thisOwner] = this._owners;
        const [thatOwner] = that._owners;
        this.transfer(thatOwner);
        that.transfer(thisOwner);
    }
}
