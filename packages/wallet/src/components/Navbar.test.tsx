import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Computer } from '@bitcoin-computer/lib'
import Navbar from './Navbar'
import { CustomDrawer } from './Utils/Drawer'

const TXID = 'ab'.repeat(32)
const PUBLIC_KEY = '02' + 'cd'.repeat(32)
const UNCOMPRESSED_KEY = '04' + 'EF'.repeat(64)

function Location() {
  const { pathname, search } = useLocation()
  return <div data-testid="location">{pathname + search}</div>
}

function renderNavbar() {
  const computer = { load: vi.fn().mockRejectedValue(new Error('not a module')) }
  render(
    <MemoryRouter>
      <Navbar setShowLogin={vi.fn()} computer={computer as unknown as Computer} />
      <Routes>
        <Route path="*" element={<Location />} />
      </Routes>
    </MemoryRouter>,
  )
}

function search(value: string) {
  const input = screen.getByPlaceholderText('Search...')
  fireEvent.change(input, { target: { value } })
  fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 })
}

describe('Navbar', () => {
  beforeEach(() => localStorage.clear())

  it('Should not treat a stored "undefined" mnemonic as logged in', () => {
    localStorage.setItem('BIP_39_KEY', 'undefined')
    renderNavbar()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('Should show the logged-in menu for a stored mnemonic', () => {
    localStorage.setItem(
      'BIP_39_KEY',
      'test test test test test test test test test test test junk',
    )
    renderNavbar()
    expect(screen.getByText('Play')).toBeInTheDocument()
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
  })

  it('Should route a 64-hex search to the transaction page', () => {
    renderNavbar()
    search(` ${TXID} `)
    expect(screen.getByTestId('location').textContent).toBe(`/transactions/${TXID}`)
  })

  it('Should route a compressed public key search to the public key view', () => {
    renderNavbar()
    search(` ${PUBLIC_KEY} `)
    expect(screen.getByTestId('location').textContent).toBe(`/?public-key=${PUBLIC_KEY}`)
  })

  it('Should route an uncompressed public key search to the public key view', () => {
    renderNavbar()
    search(UNCOMPRESSED_KEY)
    expect(screen.getByTestId('location').textContent).toBe(`/?public-key=${UNCOMPRESSED_KEY}`)
  })
})

describe('Drawer logout', () => {
  it('Should remove every stored login setting', () => {
    for (const key of ['BIP_39_KEY', 'CHAIN', 'NETWORK', 'PATH', 'URL'])
      localStorage.setItem(key, 'x')
    const computer = {
      getMnemonic: () => 'a b c',
      getAddress: () => 'mfWx',
      getPublicKey: () => PUBLIC_KEY,
      getChain: () => 'LTC',
      getNetwork: () => 'regtest',
      getPath: () => "m/44'/1'/0'",
    }
    render(<CustomDrawer id="drawer" computer={computer as unknown as Computer} />)
    for (const button of screen.getAllByRole('button', { name: 'Log out', hidden: true }))
      fireEvent.click(button)
    expect(Object.keys(localStorage)).toEqual([])
  })
})
