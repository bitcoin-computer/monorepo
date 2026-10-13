// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { initFlowbite } from 'flowbite'
import { DrawerComponent, ShowDrawer } from '../src/Drawer'

function panel() {
  const el = document.getElementById('wallet-drawer')
  if (!el) throw new Error('wallet drawer missing')
  return el
}

function scrim(container: HTMLElement) {
  const el = container.querySelector('.fixed.inset-0')
  if (!el) throw new Error('scrim missing')
  return el
}

function renderDrawer() {
  return render(
    <>
      <ShowDrawer text="Wallet" id="wallet-drawer" />
      <DrawerComponent Content={() => <div>Balance</div>} id="wallet-drawer" title="Wallet" />
    </>,
  )
}

function openWallet() {
  fireEvent.click(screen.getByRole('button', { name: 'Wallet' }))
}

function leaveFlowbiteOverlay() {
  panel().classList.add('transform-none')
  const backdrop = document.createElement('div')
  backdrop.setAttribute('drawer-backdrop', '')
  backdrop.className = 'bg-gray-900/50 fixed inset-0 z-30'
  document.body.append(backdrop)
  document.body.classList.add('overflow-hidden')
  document.body.style.overflow = 'hidden'
}

function expectOverlayGone(container: HTMLElement) {
  expect(document.querySelector('[drawer-backdrop]')).toBeNull()
  expect(document.body.classList.contains('overflow-hidden')).toBe(false)
  expect(document.body.style.overflow).not.toBe('hidden')
  expect(panel().classList.contains('transform-none')).toBe(false)
  expect(panel().classList.contains('translate-x-full')).toBe(true)
  expect(scrim(container).className).toContain('pointer-events-none')
  expect(scrim(container).className).toContain('opacity-0')
}

describe('Wallet drawer scrim', () => {
  afterEach(() => {
    document.body.classList.remove('overflow-hidden')
    document.body.style.overflow = ''
    document.querySelectorAll('[drawer-backdrop]').forEach((node) => node.remove())
    cleanup()
  })

  it('Should open from the wallet button without a Flowbite backdrop', () => {
    const { container } = renderDrawer()
    initFlowbite()
    const open = screen.getByRole('button', { name: 'Wallet' })
    expect(open.getAttribute('data-drawer-show')).toBeNull()
    expect(open.getAttribute('data-drawer-backdrop')).toBe('false')

    openWallet()
    expect(document.querySelector('[drawer-backdrop]')).toBeNull()
    expect(panel().classList.contains('translate-x-full')).toBe(false)
    expect(scrim(container).className).toContain('opacity-100')
  })

  it('Should remove every overlay when the scrim, close button, or Escape is used', () => {
    const { container } = renderDrawer()
    initFlowbite()

    openWallet()
    leaveFlowbiteOverlay()
    fireEvent.click(scrim(container))
    expectOverlayGone(container)

    openWallet()
    leaveFlowbiteOverlay()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expectOverlayGone(container)

    openWallet()
    leaveFlowbiteOverlay()
    fireEvent.keyDown(document, { key: 'Escape' })
    expectOverlayGone(container)
  })
})
