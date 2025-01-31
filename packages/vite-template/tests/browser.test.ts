import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import puppeteer, { Browser, Page } from 'puppeteer'

describe('Bitcoin Computer Tests', () => {
  let browser: Browser
  let page: Page

  async function findButtonByText(page: Page, text: string) {
    const buttons = await page.$$('button') // Select all buttons
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
    await page.goto('http://localhost:1032')
    const title = await page.title()
    expect(title).toBe('Vite + React + TS')
  })

  it('should we an h2 with text "All Counters"', async () => {
    const h2Text = await page.$eval('h2', (el) => el.textContent)
    expect(h2Text).toBe('All Counters')
  })

  it('should click the "Sign in" button, open the modal, and log in', async () => {
    await delay(5000)
    const signInButton = await findButtonByText(page, 'Sign in')
    expect(signInButton).to.not.be.null
    await signInButton!.click()

    await delay(1000)

    const loginButton = await findButtonByText(page, 'Log In')
    expect(loginButton).to.not.be.null
    await loginButton!.click()

    await delay(10000)

    const walletButton = await findButtonByText(page, 'Wallet')
    expect(walletButton).to.not.be.null
    await walletButton!.click()
    await delay(1000)
  })

  it('should click the "Wallet" button, and fund', async () => {
    const fundButton = await findButtonByText(page, 'Fund')
    expect(fundButton).to.not.be.null
    await fundButton!.click()
    await delay(500)
    await fundButton!.click()

    await delay(1000)

    const closeButton = await page.$('button[data-drawer-hide="wallet-drawer"]')
    expect(closeButton).to.not.be.null
    await closeButton!.click()
    await delay(1000)
  })

  it('should mint a counter and navigate to counter page', async () => {
    const mintButton = await page.$('#mint-button')
    expect(mintButton).to.not.be.null
    await mintButton!.click()

    await delay(1000)

    const mintCounterButton = await findButtonByText(page, 'Mint Counter')
    expect(mintCounterButton).to.not.be.null
    await mintCounterButton!.click()

    await delay(7000)
    const successDiv = await page.$('#mint-success')
    expect(successDiv).to.not.be.null

    const counterLink = await page.$('#counter-link')
    expect(counterLink).to.not.be.null
    await counterLink!.click()

    await delay(5000)
  })

  it('should input 2, open dropdown, and select "number"', async () => {
    const preElement = await page.$('#property-count-value')
    expect(preElement).to.not.be.null

    const functionIncDiv = await page.$('#function-inc')
    expect(functionIncDiv).to.not.be.null

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
  })

  it('should call the counter function and increment the counter by 2', async () => {
    const callFunctionButton = await page.$('#inc-call-function-button')
    expect(callFunctionButton).to.not.be.null
    await callFunctionButton!.click()

    await delay(5000)
    const successDiv = await page.$('#smart-call-execution-success')
    expect(successDiv).to.not.be.null

    const counterLink = await page.$('#smart-call-execution-counter-link')
    expect(counterLink).to.not.be.null
    await counterLink!.click()

    await delay(7000)

    const preElement = await page.$('#property-count-value')
    expect(preElement).to.not.be.null
    const preText = await page.evaluate((el) => el.textContent?.trim(), preElement)
    expect(preText).to.equal('2')

    await delay(5000)
  })

  it('should successfully transfer the counter to a public key', async () => {
    const functionTransferDiv = await page.$('#function-transfer')
    expect(functionTransferDiv).to.not.be.null

    const inputField = await page.$('#transfer-publicKey')
    expect(inputField).to.not.be.null
    await inputField!.click({ clickCount: 3 })
    await inputField!.type('0363f42382c95e5489b87c6b385df8711fd4908bbdc1820b33aab5d9f2b3a731b0')

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

    const callFunctionButton = await page.$('#transfer-call-function-button')
    expect(callFunctionButton).to.not.be.null
    await callFunctionButton!.click()

    await delay(5000)
    const successDiv = await page.$('#smart-call-execution-success')
    expect(successDiv).to.not.be.null
  })
})
