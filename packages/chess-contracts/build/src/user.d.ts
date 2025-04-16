import { Computer } from '@bitcoin-computer/lib';
export declare class User extends Contract {
    name: string;
    games: string[];
    constructor(name: string);
    addGame(gameId: string): void;
}
export declare class UserHelper {
    computer: Computer;
    mod?: string;
    constructor({ computer, mod }: {
        computer: Computer;
        mod?: string;
    });
    createUser(name: string): Promise<string>;
}
