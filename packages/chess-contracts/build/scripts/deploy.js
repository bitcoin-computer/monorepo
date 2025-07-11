import { Computer } from '@bitcoin-computer/lib';
import { config } from 'dotenv';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readFile, writeFile } from 'fs/promises';
import { deploy } from './lib.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { User } from '../src/user.js';
import { ChessChallengeTxWrapper } from '../src/chess-challenge.js';
config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const chessContractDirectory = `${__dirname}/..`;
const { VITE_CHAIN: chain, VITE_NETWORK: network, VITE_URL: url, MNEMONIC: mnemonic, VITE_PATH: path, } = process.env;
const rl = createInterface({ input, output });
if (network !== 'regtest' && !mnemonic)
    throw new Error('Please set MNEMONIC in the .env file');
const computer = new Computer({ chain, network, mnemonic, url, path });
if (network === 'regtest')
    await computer.faucet(2e8);
const { balance } = await computer.getBalance();
console.log(`
Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.getAddress()}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance} satoshis\x1b[0m`);
const answer = await rl.question('\nDo you want to deploy the contracts? \x1b[2m(y/n)\x1b[0m');
if (answer === 'n') {
    console.log(' - Aborting...');
    rl.close();
    process.exit(0);
}
const mod = await deploy(computer, chessContractDirectory);
const userMod = await computer.deploy(`export ${User}`);
const challengeMod = await computer.deploy(`export ${ChessChallengeTxWrapper}`);
console.log(' \x1b[2m- Successfully deployed smart contracts\x1b[0m');
const answer2 = await rl.question('\nDo you want to update your .env files? \x1b[2m(y/n)\x1b[0m');
if (answer2 === 'n') {
    console.log(`
-----------------
ACTION REQUIRED
-----------------
    
Update the following rows in your .env file.

VITE_CHESS_GAME_MOD_SPEC\x1b[2m=${mod}\x1b[0m
VITE_CHESS_USER_MOD_SPEC\x1b[2m=${userMod}\x1b[0m
VITE_CHESS_CHALLENGE_MOD_SPEC\x1b[2m=${challengeMod}\x1b[0m
`);
}
else {
    const files = ['../chess-app/.env'];
    for (const file of files) {
        // Update module specifiers in the .env file
        const lines = (await readFile(file, 'utf-8')).split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('VITE_CHESS_GAME_MOD_SPEC'))
                lines[i] = `VITE_CHESS_GAME_MOD_SPEC=${mod}`;
            if (lines[i].startsWith('VITE_CHESS_USER_MOD_SPEC'))
                lines[i] = `VITE_CHESS_USER_MOD_SPEC=${userMod}`;
            if (lines[i].startsWith('VITE_CHESS_CHALLENGE_MOD_SPEC'))
                lines[i] = `VITE_CHESS_CHALLENGE_MOD_SPEC=${challengeMod}`;
        }
        await writeFile(file, lines.join('\n'), 'utf-8');
    }
    console.log(' \x1b[2m- Successfully updated .env file\x1b[0m');
}
console.log("\nRun 'npm start' to start the application.\n");
rl.close();
//# sourceMappingURL=deploy.js.map