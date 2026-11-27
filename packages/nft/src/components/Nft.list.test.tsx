import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { UtilsProvider } from '@bitcoin-computer/components'

// Record what reaches the chain: every broadcast, nft.list call and sale price.
const calls: string[] = []
const salePrices: bigint[] = []

vi.mock('../constants/modSpecs', () => ({
  VITE_NFT_MOD_SPEC: 'nft-mod',
  VITE_TX_WRAPPER_MOD_SPEC: 'wrapper-mod',
  VITE_SALE_MOD_SPEC: 'sale-mod',
  VITE_PAYMENT_MOD_SPEC: 'payment-mod',
  VITE_WITHDRAW_MOD_SPEC: 'withdraw-mod',
}))

vi.mock('@bitcoin-computer/swap', () => ({
  TxWrapperHelper: class {
    createWrappedTx = async () => ({ tx: 'wrapped-tx' })
    addSaleTx = async () => ({ tx: 'offer-with-sale-tx' })
  },
  SaleHelper: class {
    createSaleTx = async (_nft: unknown, mock: { satoshis: bigint }) => {
      salePrices.push(mock.satoshis)
      return { tx: 'sale-tx' }
    }
  },
  PaymentMock: class {
    constructor(public satoshis: bigint) {}
  },
  PaymentHelper: class {},
}))

const { List } = await import('./Nft')

const computer = {
  getPublicKey: () => 'pubkey',
  getUrl: () => 'http://node',
  getChain: () => 'LTC',
  broadcast: async (tx: string) => {
    calls.push(`broadcast ${tx}`)
    return 'offer-txid'
  },
}
const nft = {
  list: async (txId: string) => {
    calls.push(`list ${txId}`)
  },
}

// Lets any pending async work in the submit handler run to completion.
const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 50)))

function listFor(price: string) {
  render(
    <UtilsProvider>
      <List computer={computer as never} nft={nft as never} />
    </UtilsProvider>,
  )
  fireEvent.change(screen.getByPlaceholderText('Amount in LTC'), { target: { value: price } })
  fireEvent.click(screen.getByText('List for Sale'))
}

describe('List for sale', () => {
  beforeEach(() => {
    calls.length = 0
    salePrices.length = 0
  })

  it('passes the exact price to the sale for amounts not exact in floating point', async () => {
    listFor('0.29')
    await waitFor(() => expect(calls).toHaveLength(3))
    await settle()
    expect(calls).toEqual([
      'broadcast wrapped-tx',
      'list offer-txid',
      'broadcast offer-with-sale-tx',
    ])
    expect(salePrices).toEqual([29_000_000n])
  })

  for (const [price, error] of [
    ['0.123456789', 'Use at most 8 decimal places'],
    ['0', 'Provide an amount greater than zero'],
    ['1e-7', 'Enter the price as a plain decimal, e.g. 0.29'],
    ['92233720368.54775808', 'Amount is too large'],
  ]) {
    it(`broadcasts nothing for ${price}`, async () => {
      listFor(price)
      expect(await screen.findByText(error)).toBeInTheDocument()
      await settle()
      expect(calls).toEqual([])
    })
  }
})
