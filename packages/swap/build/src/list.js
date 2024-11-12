const { Contract } = await import('@bitcoin-computer/lib');
export class List extends Contract {
    constructor() {
        super({ elements: [] });
    }
    add(key) {
        this.elements = [key, ...this.elements];
    }
    delete(key) {
        this.elements = this.elements.filter((el) => el !== key);
    }
}
export class ListHelper {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${List}`);
        return this.mod;
    }
}
