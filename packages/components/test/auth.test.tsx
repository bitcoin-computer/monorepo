// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { Auth } from '../src/Auth'
import { Modal } from '../src/Modal'

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

function installLocation() {
  let href = 'http://localhost/playground?example=counter'
  const previous = window.location
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      get href() {
        return href
      },
      set href(value: string) {
        href = value
      },
    },
  })
  return {
    get href() {
      return href
    },
    restore() {
      Object.defineProperty(window, 'location', { configurable: true, value: previous })
    },
  }
}

function submitLogin(container: HTMLElement) {
  select(container, 'chain-ltc')
  select(container, 'network-regtest')
  fireEvent.click(container.querySelector('button[type="submit"]') as HTMLButtonElement)
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

describe('Login session', () => {
  let location: ReturnType<typeof installLocation>
  const stops: Array<() => void> = []

  beforeEach(() => {
    localStorage.clear()
    location = installLocation()
  })

  afterEach(() => {
    stops.splice(0).forEach((stop) => stop())
    location.restore()
    cleanup()
    localStorage.clear()
  })

  it('Should redirect home when no listener handles login', () => {
    const { container } = render(<Auth.LoginForm />)
    submitLogin(container)
    expect(location.href).toBe('/')
    expect(localStorage.getItem('BIP_39_KEY')).toBeTruthy()
  })

  it('Should stay on the page and close the modal when a listener handles login', () => {
    const onSession = vi.fn()
    stops.push(Auth.onLogin(onSession))
    const { container } = render(<Auth.LoginModal />)
    Modal.showModal('sign-in-modal')
    const modal = document.getElementById('sign-in-modal')
    expect(modal?.classList.contains('hidden')).toBe(false)
    const backdropBefore = [...document.body.children].filter(
      (el) => typeof el.className === 'string' && el.className.includes('inset-0'),
    )
    expect(backdropBefore.length).toBeGreaterThan(0)

    submitLogin(container)

    expect(onSession).toHaveBeenCalledOnce()
    expect(location.href).toBe('http://localhost/playground?example=counter')
    expect(localStorage.getItem('BIP_39_KEY')).toBeTruthy()
    expect(modal?.classList.contains('hidden')).toBe(true)
    expect(modal?.classList.contains('flex')).toBe(false)
    const backdropAfter = [...document.body.children].filter(
      (el) => typeof el.className === 'string' && el.className.includes('inset-0'),
    )
    expect(backdropAfter).toEqual([])
  })

  it('Should still redirect home on logout', () => {
    localStorage.setItem(
      'BIP_39_KEY',
      'seed seed seed seed seed seed seed seed seed seed seed seed',
    )
    localStorage.setItem('CHAIN', 'LTC')
    Auth.logout()
    expect(location.href).toBe('/')
    expect(localStorage.getItem('BIP_39_KEY')).toBeNull()
    expect(localStorage.getItem('CHAIN')).toBeNull()
  })
})
