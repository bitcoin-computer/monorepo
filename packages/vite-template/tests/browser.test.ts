import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import puppeteer, { Browser, Page } from 'puppeteer'

describe('Bitcoin Computer Tests', () => {
  let browser: Browser
  let page: Page

  async function findButtonByText(page: Page, text: string) {
    const buttons = await page.$$('button')
    for (const button of buttons) {
      const buttonText = await page.evaluate((el) => el.textContent?.trim(), button)
      if (buttonText === text) {
        return button
      }
    }
    return null
  }

  async function waitForSelectorAndClick(page: Page, selector: string, clickCount: number = 1) {
    await page.waitForSelector(selector, { visible: true, hidden: false })
    const selectorElement = await page.$(selector)
    await selectorElement!.click({ clickCount })
    return selectorElement
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS === 'true',
    })
    page = await browser.newPage()
  })

  afterAll(async () => {
    await browser.close()
  })

  it('should load the page and have correct headers', async () => {
    const response = await page.goto(process.env.URL ? process.env.URL : 'http://localhost:1032')
    const title = await page.title()
    expect(title).toBe('Vite + React + TS')

    expect(response).not.toBeNull()
    if (response) {
      const headers = response.headers()
      expect(headers['cross-origin-opener-policy']).toBe('same-origin')
      expect(headers['cross-origin-embedder-policy']).toBe('require-corp')
    }
  })

  it('should display h2 with text "All Counters"', async () => {
    await page.waitForSelector('h2', { visible: true })
    const h2Text = await page.$eval('h2', (el) => el.textContent)
    expect(h2Text).toBe('All Counters')
  })

  it('should click the "Sign in" button, open the modal, and log in', async () => {
    await delay(2000)
    await page.waitForSelector('span.loading-smart-contract-span', { hidden: true })
    const signInButton = await findButtonByText(page, 'Sign in')
    await signInButton!.click()

    await page.waitForSelector('button[type="submit"]', { visible: true })
    const loginButton = await findButtonByText(page, 'Log In')
    await loginButton!.click()
    await delay(3000)
  })

  it('should click the "Wallet" button, and fund', async () => {
    await waitForSelectorAndClick(page, 'button[data-drawer-target="wallet-drawer"]')
    await delay(3000)
    try {
      await page.waitForSelector('#fund-wallet', { visible: true, timeout: 1000 })
      await delay(1000)
      await page.waitForSelector('#fund-wallet', { visible: true, timeout: 1000 })
    } catch (e) {
      console.log('Wallet drawer not open, retrying...', e)
      await waitForSelectorAndClick(page, 'button[data-drawer-target="wallet-drawer"]')
    }

    await waitForSelectorAndClick(page, '#fund-wallet')
    await delay(2000)
    await waitForSelectorAndClick(page, 'button[data-drawer-hide="wallet-drawer"]')
    await delay(1000)
  })

  it('should mint a counter and navigate to counter page', async () => {
    await waitForSelectorAndClick(page, '#mint-button')

    await waitForSelectorAndClick(page, '#mint-counter-button')

    await waitForSelectorAndClick(page, '#counter-link')

    await delay(2000)
  })

  it('should input 2, open dropdown, and select "number"', async () => {
    const inputField = await waitForSelectorAndClick(page, '#inc-num', 3)
    await inputField!.type('2')

    await waitForSelectorAndClick(page, '#dropdownButtonincnum')

    await page.waitForSelector('#dropdownMenuincnum', { visible: true })
    const numberOption = await page.evaluateHandle(() => {
      return [...document.querySelectorAll('#dropdownMenuincnum span')].find(
        (el) => el.textContent?.trim() === 'number',
      )
    })
    await numberOption!.click()

    await delay(1000)
  })

  it('should call the counter function and increment the counter by 2', async () => {
    await waitForSelectorAndClick(page, '#inc-call-function-button')

    await waitForSelectorAndClick(page, '#smart-call-execution-counter-link')
    await delay(1000)

    await page.waitForSelector('#property-count-value', { visible: true, hidden: false })
    const preElement = await page.$('#property-count-value')
    const preText = await page.evaluate((el) => el.textContent?.trim(), preElement)
    expect(preText).to.equal('2')
    await delay(1000)
  })

  it('should successfully transfer the counter to a public key', async () => {
    const inputField = await waitForSelectorAndClick(page, '#transfer-publicKey', 3)
    await inputField!.type('0363f42382c95e5489b87c6b385df8711fd4908bbdc1820b33aab5d9f2b3a731b0')

    await waitForSelectorAndClick(page, '#dropdownButtontransferpublicKey')

    await page.waitForSelector('#dropdownMenutransferpublicKey', { visible: true })
    const stringOption = await page.evaluateHandle(() => {
      return [...document.querySelectorAll('#dropdownMenutransferpublicKey span')].find(
        (el) => el.textContent?.trim() === 'string',
      )
    })
    await stringOption!.click()

    await waitForSelectorAndClick(page, '#transfer-call-function-button')

    await page.waitForSelector('#smart-call-execution-success', { visible: true, hidden: false })
    const successDiv = await page.$('#smart-call-execution-success')
    if (!successDiv) {
      throw new Error('Counter transfer unsuccessful')
    }
    await delay(1000)
  })
})
