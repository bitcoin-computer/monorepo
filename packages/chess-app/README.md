# Bitcoin Computer Chess App

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
