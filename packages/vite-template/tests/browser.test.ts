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

  it('should display the correct title', async () => {
    await page.goto(process.env.URL ? process.env.URL : 'http://localhost:1032')
    const title = await page.title()
    expect(title).toBe('Vite + React + TS')
  })

  it('should we an h2 with text "All Counters"', async () => {
    await page.waitForSelector('h2', { visible: true })
    const h2Text = await page.$eval('h2', (el) => el.textContent)
    expect(h2Text).toBe('All Counters')
  })

  it('should click the "Sign in" button, open the modal, and log in', async () => {
    await delay(2000)
    await page.waitForSelector('span.loading-smart-contract-span', { hidden: true })
    const signInButton = await findButtonByText(page, 'Sign in')
    expect(signInButton).to.not.be.null
    await signInButton!.click()

    await page.waitForSelector('button[type="submit"]', { visible: true })

    const loginButton = await findButtonByText(page, 'Log In')
    expect(loginButton).to.not.be.null
    await loginButton!.click()

    await page.waitForSelector('button[data-drawer-target="wallet-drawer"]', { visible: true })

    const walletButton = await findButtonByText(page, 'Wallet')
    expect(walletButton).to.not.be.null
    await walletButton!.click()
    await delay(1000)
  })

  it('should click the "Wallet" button, and fund', async () => {
    await page.waitForSelector('#fund-wallet', { visible: true })
    const fundButton = await findButtonByText(page, 'Fund')
    expect(fundButton).to.not.be.null
    await fundButton!.click()

    await page.waitForSelector('button[data-drawer-hide="wallet-drawer"]', { visible: true })

    const closeButton = await page.$('button[data-drawer-hide="wallet-drawer"]')
    expect(closeButton).to.not.be.null
    await closeButton!.click()
    await delay(1000)
  })

  it('should mint a counter and navigate to counter page', async () => {
    await page.waitForSelector('#mint-button', { visible: true, hidden: false })
    const mintButton = await page.$('#mint-button')
    expect(mintButton).to.not.be.null
    await mintButton!.click()

    await page.waitForSelector('#mint-counter-button', { visible: true, hidden: false })
    const mintCounterButton = await await page.$('#mint-counter-button')
    expect(mintCounterButton).to.not.be.null
    await mintCounterButton!.click()

    await page.waitForSelector('#mint-success', { visible: true, hidden: false })
    const successDiv = await page.$('#mint-success')
    expect(successDiv).to.not.be.null

    const counterLink = await page.$('#counter-link')
    expect(counterLink).to.not.be.null
    await counterLink!.click()

    await delay(1000)
  })

  it('should input 2, open dropdown, and select "number"', async () => {
    await page.waitForSelector('#property-count-value', { visible: true, hidden: false })
    const preElement = await page.$('#property-count-value')
    expect(preElement).to.not.be.null

    await page.waitForSelector('#function-inc', { visible: true, hidden: false })
    const functionIncDiv = await page.$('#function-inc')
    expect(functionIncDiv).to.not.be.null

    await page.waitForSelector('#inc-num', { visible: true, hidden: false })
    const inputField = await page.$('#inc-num')
    expect(inputField).to.not.be.null
    await inputField!.click({ clickCount: 3 })
    await inputField!.type('2')

    const dropdownButton = await page.$('#dropdownButtonincnum')
    expect(dropdownButton).to.not.be.null
    await dropdownButton!.click()

    await page.waitForSelector('#dropdownMenuincnum', { visible: true })

    const numberOption = await page.evaluateHandle(() => {
      return [...document.querySelectorAll('#dropdownMenuincnum span')].find(
        (el) => el.textContent?.trim() === 'number',
      )
    })

    expect(numberOption).to.not.be.null
    await numberOption!.click()

    await delay(1000)
  })

  it('should call the counter function and increment the counter by 2', async () => {
    await page.waitForSelector('#inc-call-function-button', { visible: true, hidden: false })
    const callFunctionButton = await page.$('#inc-call-function-button')
    expect(callFunctionButton).to.not.be.null
    await callFunctionButton!.click()

    await page.waitForSelector('#smart-call-execution-success', { visible: true, hidden: false })
    const successDiv = await page.$('#smart-call-execution-success')
    expect(successDiv).to.not.be.null

    await page.waitForSelector('#smart-call-execution-counter-link', {
      visible: true,
      hidden: false,
    })
    const counterLink = await page.$('#smart-call-execution-counter-link')
    expect(counterLink).to.not.be.null
    await counterLink!.click()
    await delay(1000)

    await page.waitForSelector('#property-count-value', { visible: true, hidden: false })
    const preElement = await page.$('#property-count-value')
    expect(preElement).to.not.be.null
    const preText = await page.evaluate((el) => el.textContent?.trim(), preElement)
    expect(preText).to.equal('2')
    await delay(1000)
  })

  it('should successfully transfer the counter to a public key', async () => {
    await page.waitForSelector('#function-transfer', { visible: true, hidden: false })
    const functionTransferDiv = await page.$('#function-transfer')
    expect(functionTransferDiv).to.not.be.null

    await page.waitForSelector('#transfer-publicKey', { visible: true, hidden: false })
    const inputField = await page.$('#transfer-publicKey')
    expect(inputField).to.not.be.null
    await inputField!.click({ clickCount: 3 })
    await inputField!.type('0363f42382c95e5489b87c6b385df8711fd4908bbdc1820b33aab5d9f2b3a731b0')

    await page.waitForSelector('#dropdownButtontransferpublicKey', { visible: true, hidden: false })
    const dropdownButton = await page.$('#dropdownButtontransferpublicKey')
    expect(dropdownButton).to.not.be.null
    await dropdownButton!.click()

    await page.waitForSelector('#dropdownMenutransferpublicKey', { visible: true })
    const stringOption = await page.evaluateHandle(() => {
      return [...document.querySelectorAll('#dropdownMenutransferpublicKey span')].find(
        (el) => el.textContent?.trim() === 'string',
      )
    })

    expect(stringOption).to.not.be.null
    await stringOption!.click()

    await page.waitForSelector('#transfer-call-function-button', { visible: true, hidden: false })
    const callFunctionButton = await page.$('#transfer-call-function-button')
    expect(callFunctionButton).to.not.be.null
    await callFunctionButton!.click()

    await page.waitForSelector('#smart-call-execution-success', { visible: true, hidden: false })
    const successDiv = await page.$('#smart-call-execution-success')
    expect(successDiv).to.not.be.null
    await delay(1000)
  })
})
