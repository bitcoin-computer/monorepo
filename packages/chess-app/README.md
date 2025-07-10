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
