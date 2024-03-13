import { Computer } from '@bitcoin-computer/lib'
import { NFT } from './nft'

export async function deploy(computer: Computer) {  
  if (computer.getNetwork() === 'regtest')
    await computer.faucet(0.1e8)
  
  return computer.deploy(`export ${NFT}`)
}

let computer = new Computer({
  network: 'regtest',
  chain: 'LTC',
  url: 'http://localhost:1031',
})

const rev = await deploy(computer)
console.log(`Deployed NFT module at ${rev}`)
