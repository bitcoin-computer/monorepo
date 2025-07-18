export class User extends Contract {
    constructor(name) {
        super({ name, games: [] });
    }
    addGame(gameId) {
        this.games.push(gameId);
    }
}
export class UserHelper {
    constructor({ computer, mod }) {
        this.computer = computer;
        this.mod = mod;
    }
    async createUser(name) {
        if (!name || !name.trim()) {
            throw new Error('Name can not be empty');
        }
        const { tx } = await this.computer.encode({
            exp: `new User("${name}")`,
            mod: this.mod,
        });
        return this.computer.broadcast(tx);
    }
}
//# sourceMappingURL=user.js.map