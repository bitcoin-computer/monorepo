import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

// Create wallet
const computer = new Computer({ chain, network, url })

describe('deploy', () => {
  // Fund wallet
  before('Fund client side wallet', async () => {
    await computer.faucet(1e8)
  })

  // Modules stored in multisig scripts
  it('Should deploy a module using multisig', async () => {
    const multisigComputer = new Computer({
      chain,
      network,
      url,
      moduleStorageType: 'multisig',
      satPerByte: 4,
    })
    await multisigComputer.faucet(1881764) // 1.9M sats
    const big = `x`.repeat(12155) // ~ 12KB ==>> Each stored byte costs 157 satoshis aprox

    const rev = await multisigComputer.deploy(big)
    expect(rev).to.not.equal(undefined)
  })

  // Modules stored in taproot scripts
  it('Should deploy a module using taproot', async () => {
    if (['BTC', 'LTC'].includes(chain)) {
      const taprootComputer = new Computer({ chain, network, url, moduleStorageType: 'taproot' })
      await taprootComputer.faucet(436000)
      const veryBig = `x`.repeat(396000) // ~ 400KB

      const rev = await taprootComputer.deploy(veryBig)
      expect(rev).to.not.equal(undefined)
    }
  })

  // Modules that depends on one another
  it('Should deploy a module that depends on another module', async () => {
    const modSpecA = await computer.deploy(`export class A extends Contract {}`)

    const modSpecB = await computer.deploy(`
      import { A } from '${modSpecA}'
      export class B extends A {}
    `)
    const { tx } = await computer.encode({ exp: `new B()`, mod: modSpecB })
    expect(tx.getId()).to.be.a.string
  })

  // Modules of arbitrary size
  it('Should deploy a module of arbitrary length', async () => {
    // Inputs a long string and outputs a module specifier where it can be obtained
    const store = async (s: string, n: number) => {
      // Partition the long string into chunks of size n
      const chunks = []
      for (let i = 0; i < s.length; i += n) {
        chunks.push(s.slice(i, i + n))
      }

      // Deploy chunks and build recombining module
      let module = ''
      for (let i = 0; i < s.length / n; i += 1) {
        // Deploy a chunk
        const mod = await computer.deploy(`export const c${i} = '${chunks[i]}'`)

        // Import chunk into recombining module
        module += `import { c${i} } from '${mod}'\n`
      }

      // Export concatenation of chunks
      const cs = Array.from({ length: n + 1 }, (_, i) => `c${i}`).join(' + ')
      module += `export const s = ${cs}`

      // Deploy recombining module
      return computer.deploy(module)
    }

    // Create a long string, could be hundreds MB in a real example
    const longString = '0'.repeat(10)

    // Store long string, you can use 18262 instead of 3 for multisig modules
    // or 396000 for taproot modules
    const mod = await store(longString, 3)

    // Load a long string
    const { s } = await computer.load(mod)
    expect(s).eq(longString)
  })
})
