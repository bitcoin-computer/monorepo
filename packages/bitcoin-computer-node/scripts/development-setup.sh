#!/bin/bash

start_test_btc() {
    BCN_URL=http://127.0.0.1:3000 BCN_ENV=dev CHAIN=BTC NETWORK=regtest POSTGRES_HOST=127.0.0.1 RPC_HOST=127.0.0.1 RPC_PORT=8332  RPC_PROTOCOL=http RPC_USER=bcn-admin RPC_PASSWORD=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= ZMQ_URL=tcp://127.0.0.1:28332 UN_P2SH_URL=http://127.0.0.1:3000 nodemon --ignore test/ --ignore bcn.config.json --ignore bcn.test.config.json src/app.ts
}

start_test_ltc() {
    BCN_URL=http://127.0.0.1:3000 BCN_ENV=dev CHAIN=LTC NETWORK=regtest POSTGRES_HOST=127.0.0.1 RPC_HOST=127.0.0.1 RPC_PORT=19332  RPC_PROTOCOL=http RPC_USER=bcn-admin RPC_PASSWORD=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= ZMQ_URL=tcp://127.0.0.1:28332 UN_P2SH_URL=http://127.0.0.1:3000 nodemon --ignore test/ --ignore bcn.config.json --ignore bcn.test.config.json src/app.ts
}
