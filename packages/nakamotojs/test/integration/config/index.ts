import { config } from 'dotenv';

config({ path: '../node/.env' });

export const CHAIN = process.env.BCN_CHAIN || 'LTC';
export const NETWORK = process.env.BCN_NETWORK || 'regtest';
export const RPC_PROTOCOL = process.env.BITCOIN_RPC_PROTOCOL || 'http';
export const RPC_USER = process.env.BITCOIN_RPC_USER || 'test';
export const RPC_PASSWORD = process.env.BITCOIN_RPC_PASSWORD || 'test';
export const RPC_HOST = process.env.BITCOIN_RPC_HOST || '127.0.0.1';
export const RPC_PORT = process.env.BITCOIN_RPC_PORT || '19332';
