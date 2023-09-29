import * as dotenv from 'dotenv'
import { Computer } from '@bitcoin-computer/lib'

dotenv.config()

export async function fund(chain, addressesList: string[] = []) {
  const addresses = process.env.TEST_ADDRESS.split(';').concat(addressesList)

  const network = (process.env.NETWORK as any) || 'regtest'
  const port = process.env.PORT || 1031
  const url = process.env.BCN_URL || `http://localhost:${port}`
  const computer = new Computer({ chain, network, url })

  // send to address
  for (let i = 0; i < addresses.length; i += 1)
    // eslint-disable-next-line no-await-in-loop
    await computer.rpcCall('generateToAddress', `1 ${addresses[i]}`)

  // generate 100 blocks on top
  await computer.rpcCall('generateToAddress', '100 mrpdUjdfFZQWRYaqgqjgoXTJqn5rwahTHr')
}

const [, , chain, ...addressList] = process.argv

fund(chain.toUpperCase(), addressList).then(() => process.exit(0))
