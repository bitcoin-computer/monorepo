# Chess Server

## Usage

### Development

Start the database

```
npm run start-postgress
```

Start the express server

```
npm run start:dev
```

### Production

Build Docker and start the server

```
npm run build-docker
npm run up
```

### Deploy Smart Contract

Deploy the smart contract. The script will prompt you to update the `.env` files in this package as well as in the packages `chess-contracts` and `chess-app`.

```
npm run deploy
```

### Tests

Start the server and run

```
npm test
```