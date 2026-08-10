export const config = {
    DEFAULT_CHAIN: 'LTC',
    DEFAULT_NETWORK: 'regtest',
    DEFAULT_URL: 'http://localhost:1031',
    FAUCET_AMOUNT: Number(process.env.FAUCET_AMOUNT) || 100000000,
    getInitialDifficulty(chain = process.env.CHAIN || 'LTC') {
        const map = {
            BTC: Number(process.env.INITIAL_DIFFICULTY) || 16,
            LTC: Number(process.env.INITIAL_DIFFICULTY) || 16,
            DOGE: Number(process.env.INITIAL_DIFFICULTY) || 12,
            PEPE: Number(process.env.INITIAL_DIFFICULTY) || 14,
        };
        return map[chain] || 16;
    },
    getAdjustmentInterval(chain = process.env.CHAIN || 'LTC') {
        const map = {
            BTC: Number(process.env.ADJUSTMENT_INTERVAL) || 2016,
            LTC: Number(process.env.ADJUSTMENT_INTERVAL) || 2016,
            DOGE: Number(process.env.ADJUSTMENT_INTERVAL) || 1440,
            PEPE: Number(process.env.ADJUSTMENT_INTERVAL) || 1008,
        };
        return map[chain] || 2016;
    },
};
