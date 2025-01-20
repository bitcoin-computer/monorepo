# Chess Server

## Usage

Start a Bitcoin Computer Node in the package `node`. Then copy the `.env.example` file.

```
cp .env.example .env
```

### Deploy Smart Contract

Deploy the smart contract. The script will prompt you to update the `.env` files in this package as well as in the packages `chess-contracts` and `chess-app`.

```
npm run deploy
```

### Development

Start the database.

```
npm run start:postgress
```

Then start the express server.

```
npm run start:dev
```

### Production

Build Docker and start the database and express servers.

```
npm run build-docker
npm run up
```

### Tests

```
npm test
```
