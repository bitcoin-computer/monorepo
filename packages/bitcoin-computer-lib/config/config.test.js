import config from './config'

const { CHAIN = 'LTC', NETWORK = 'regtest', RPC_USER, RPC_PASSWORD, RPC_HOST } = process.env
const BCN_URL = 'http://127.0.0.1:3000'
const RPC_PROTOCOL = 'http'
const RPC_PORT = process.env.CHAIN === 'LTC' ? 19332 : 8332
const TEST_ADDRESSES =
  'mwADSUHvPCGrrX4ozP8Kcd5JCWK93rnc8h;moMoH1vTgCc2dkDfGSKYPnafxy22wSqgrr;mmQEk8VwtSehRryLF8jhVapYg553hJGhNa;miKQVhZbFKSsJcQZ8eXwBQ89xNyetpN34q;mzoGRNh55y9j57TPdwRGi3nt9X4CFwpqUS;n1X6JFDyxibtdhYrc7mrkuft6o168ELFNW;mjLcig6eTZVJkgRgJFMkwrYHpfMnZ1t4kk;mfYkMQAe7afeRSkgLxAtwnMVryjLTfr95Q'

export default {
  ...config,
  CHAIN,
  NETWORK,
  BCN_URL,
  RPC_PROTOCOL,
  RPC_USER,
  RPC_PASSWORD,
  RPC_HOST,
  RPC_PORT,
  TEST_ADDRESSES,
}
