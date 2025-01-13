export const bitcoin = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bc',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};
export const regtest = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bcrt',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};
export const testnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};
export const litecoin = {
  messagePrefix: '\x18Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0x80,
};
export const litecoinregtest = {
  messagePrefix: '\x18Litecoin Signed Message:\n',
  bech32: 'rltc',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0x3a,
  wif: 0xef,
};
export const litecointestnet = {
  messagePrefix: '\x18Litecoin Signed Message:\n',
  bech32: 'tltc',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0x3a,
  wif: 0xef,
};
export const pepecoin = {
  messagePrefix: '\x18Pepecoin Signed Message:\n',
  bech32: 'pepe',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x38,
  scriptHash: 0x16,
  wif: 0x9e,
};
export const pepecoinregtest = {
  messagePrefix: '\x18Pepecoin Signed Message:\n',
  bech32: 'rpepe',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};
export const pepecointestnet = {
  messagePrefix: '\x18Pepecoin Signed Message:\n',
  bech32: 'tpepe',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x71,
  scriptHash: 0xc4,
  wif: 0xf1,
};
export function getNetwork(chain, network) {
  switch (chain) {
    case 'BTC':
      switch (network) {
        case 'mainnet':
          return bitcoin;
        case 'testnet':
          return testnet;
        case 'regtest':
          return regtest;
        default:
          throw new Error(`Invalid network ${network}`);
      }
    case 'LTC':
      switch (network) {
        case 'mainnet':
          return litecoin;
        case 'testnet':
          return litecointestnet;
        case 'regtest':
          return litecoinregtest;
        default:
          throw new Error(`Invalid network ${network}`);
      }
    case 'PEPE':
      switch (network) {
        case 'mainnet':
          return pepecoin;
        case 'testnet':
          return pepecointestnet;
        case 'regtest':
          return pepecoinregtest;
        default:
          throw new Error(`Invalid network ${network}`);
      }
    default:
      throw new Error(`Invalid chain ${network}`);
  }
}
export const NETWORKS = {
  // Bitcoin
  bitcoin,
  regtest,
  testnet,
  // Litecoin
  litecoin,
  litecoinregtest,
  litecointestnet,
  // Pepecoin
  pepecoin,
  pepecoinregtest,
  pepecointestnet,
};
