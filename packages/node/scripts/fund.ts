import * as dotenv from 'dotenv'
import { Computer } from '@bitcoin-computer/lib'

dotenv.config()

export async function fund(chain, addresses: string[] = []) {
  const network = (process.env.NETWORK as any) || 'regtest'
  const port = process.env.PORT || '1031'
  const url = process.env.BCN_URL || `http://localhost:${port}`
  const computer = new Computer({ chain, network, url })

  // Send to address
  await Promise.all(
    addresses.map((address) => computer.rpcCall('generateToAddress', `1 ${address}`)),
  )

  // Mine 100 blocks on top
  await computer.rpcCall('generateToAddress', '100 mrpdUjdfFZQWRYaqgqjgoXTJqn5rwahTHr')
}

const [, , chain, ...addressList] = process.argv

fund(chain.toUpperCase(), addressList).then(() => process.exit(0))
