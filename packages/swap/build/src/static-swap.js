export class StaticSwap extends Contract {
    static exec(a, b) {
        const [ownerA] = a._owners;
        const [ownerB] = b._owners;
        a.transfer(ownerB);
        b.transfer(ownerA);
    }
}
export class StaticSwapHelper {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${StaticSwap}`);
        return this.mod;
    }
    async createSwapTx(a, b) {
        return this.computer.encode({
            exp: `StaticSwap.exec(a, b)`,
            env: { a: a._rev, b: b._rev },
            mod: this.mod
        });
    }
    async checkSwapTx(tx, pubKeyA, pubKeyB) {
        const { exp, env, mod } = await this.computer.decode(tx);
        if (exp !== 'StaticSwap.exec(a, b)')
            throw new Error('Unexpected expression');
        if (mod !== this.mod)
            throw new Error('Unexpected module specifier');
        const { effect: { res: r, env: e } } = await this.computer.encode({ exp, env, mod });
        if (r !== undefined)
            throw new Error('Unexpected result');
        if (Object.keys(e).toString() !== 'a,b')
            throw new Error('Unexpected environment');
        const { a, b } = e;
        if (a._owners.toString() !== pubKeyB)
            throw new Error('Unexpected owner');
        if (b._owners.toString() !== pubKeyA)
            throw new Error('Unexpected owner');
        return e;
    }
}
