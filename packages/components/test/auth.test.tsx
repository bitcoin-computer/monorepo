// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { Auth } from '../src/Auth'

// The form only needs a mnemonic from the library; its node build does not load under jsdom.
vi.mock('@bitcoin-computer/lib', () => ({
  Computer: class {
    getMnemonic() {
      return 'test test test test test test test test test test test junk'
    }
  },
}))

function pathInput(container: HTMLElement): HTMLInputElement {
  const inputs = [...container.querySelectorAll('input:not([type])')] as HTMLInputElement[]
  const input = inputs.find((i) => i.value.startsWith('m/'))
  if (!input) throw new Error('path input not found')
  return input
}

function select(container: HTMLElement, id: string) {
  fireEvent.click(container.querySelector(`#${id}`) as HTMLInputElement)
}

describe('LoginForm derivation path', () => {
  beforeEach(() => localStorage.clear())
  afterEach(cleanup)

  it('Should follow the selected chain and network', () => {
    const { container } = render(<Auth.LoginForm />)
    expect(pathInput(container).value).toBe("m/44'/1'/0'")

    select(container, 'chain-btc')
    select(container, 'network-mainnet')
    expect(pathInput(container).value).toBe("m/44'/0'/0'")

    select(container, 'chain-ltc')
    expect(pathInput(container).value).toBe("m/44'/2'/0'")

    select(container, 'network-testnet')
    expect(pathInput(container).value).toBe("m/44'/1'/0'")
  })

  it('Should keep a path the user entered', () => {
    const { container } = render(<Auth.LoginForm />)
    fireEvent.change(pathInput(container), { target: { value: "m/44'/0'/5'" } })

    select(container, 'chain-btc')
    select(container, 'network-mainnet')
    expect(pathInput(container).value).toBe("m/44'/0'/5'")
  })
})
