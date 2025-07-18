<div align="center">
  <img src="./imgs/chess.png" alt="chess-app-screenshot" border="0" style=""/>
  <h1>Bitcoin Computer Chess</h1>
  <p>
    An App for Wagering on Chess
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

This app allows two users to wager on a game of chess. There are no middlemen, the wagers are held in a 2-of-2 multisig address between the players. **The current version requires that the winner trusts that the looser will help to retrieve the winnings, otherwise the wagers remain locked.**

A future version will be completely trustless, governed by a smart contract.

**This is a work in progress and not recommended for production use.**

## Usage

Start a Bitcoin Computer Node in the package `node`. Then copy the `.env.example` file.

```
cp .env.example .env
```

Deploy the smart contracts in the package `chess-contracts`.

```
cd ../chess-contracts
cp .env.example .env
npm run deploy
cd ../chess-app
```

Start the App

```
npm start
```

### Test

```
npm test
```

### Start the App

```
npm start
```

## License

This software is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file.

This software includes patented technology that requires payment for use on mainnet or production environments. Please review the [LEGAL.md](./LEGAL.md) file for details on patent usage and payment requirements.
