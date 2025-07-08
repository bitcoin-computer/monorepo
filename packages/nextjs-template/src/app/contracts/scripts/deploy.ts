import { Computer } from "@bitcoin-computer/lib";
import { config } from "dotenv";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { deployCounter } from "./lib";
import { fileURLToPath } from "url";
import { dirname } from "path";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const contractDirectory = `${__dirname}`;
console.log("\n\n", contractDirectory);

const {
  NEXT_PUBLIC_CHAIN: chain,
  NEXT_PUBLIC_NETWORK: network,
  NEXT_PUBLIC_URL: url,
  MNEMONIC: mnemonic,
  NEXT_PUBLIC_PATH: path,
} = process.env;

const rl = createInterface({ input, output });
if (network !== "regtest" && !mnemonic)
  throw new Error("Please set MNEMONIC in the .env file");

const computer = new Computer({ chain, network, mnemonic, url, path });

if (network === "regtest") await computer.faucet(2e8);
const { balance } = await computer.getBalance();

console.log(`
Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.getAddress()}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance} satoshis\x1b[0m`);

const answer = await rl.question(
  "\nDo you want to deploy the contracts? \x1b[2m(y/n)\x1b[0m"
);
if (answer === "n") {
  console.log(" - Aborting...");
  rl.close();
  process.exit(0);
}

const mod = await deployCounter(computer, contractDirectory);
console.log(" \x1b[2m- Successfully deployed smart contracts\x1b[0m");

console.log(`
-----------------
ACTION REQUIRED
-----------------

Update the following rows in your .env file.

NEXT_PUBLIC_COUNTER_MOD_SPEC\x1b[2m=${mod}\x1b[0m
`);

console.log("\nRun 'npm start' to start the application.\n");
rl.close();
