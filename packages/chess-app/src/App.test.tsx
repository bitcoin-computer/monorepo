import { Computer } from "@bitcoin-computer/lib"
import { screen, render } from "@testing-library/react"
import App from "./App"
import { sleep } from "./test-utils/utils"

describe("App", () => {
  it("renders the App component", () => {
    render(<App />)
    const linkElement = screen.getByText(/All Games/i)
    expect(linkElement).toBeInTheDocument()
  })
})

describe("Game and Payment", () => {
  let playerWhite: InstanceType<typeof Computer>
  let playerBlack: InstanceType<typeof Computer>

  class TestPayment extends Contract {
    constructor(amount: number, pubKeyWhite: string, pubKeyBlack: string) {
      super({ _amount: amount, _owners: [pubKeyWhite, pubKeyBlack] })
    }

    setOwner(pubKey: string) {
      this._owners = [pubKey]
    }

    withdraw() {
      this._amount = 0
    }
  }

  class Game extends Contract {
    payment?: TestPayment
    winnerPubKey?: string
    pubKeyBlack?: string
    pubKeyWhite?: string
    constructor(pubKeyWhite: string, pubKeyBlack: string) {
      super({ pubKeyWhite, pubKeyBlack, _owners: [pubKeyWhite, pubKeyBlack] })
    }

    setPayment(payment: TestPayment) {
      this.payment = payment
    }

    setWinner(winner: "black" | "white") {
      if (!this.payment) {
        throw new Error("no payment set")
      }
      this.winnerPubKey = winner.toLowerCase() === "black" ? this.pubKeyBlack : this.pubKeyWhite
      if (!this.winnerPubKey) {
        throw new Error("Error occured while setting winner")
      }
      this.payment.setOwner(this.winnerPubKey)
    }

    getWinner() {
      return this.winnerPubKey
    }

    withdraw() {
      if (!this.payment) {
        throw new Error("no payment set")
      }
      if (!this.winnerPubKey) {
        throw new Error("no winner set")
      }
      // we can't set owner here otherwise it doesn't take effect
      this.payment.withdraw()
    }
  }

  beforeAll(async () => {
    const { VITE_CHAIN: CHAIN, VITE_NETWORK: NETWORK, VITE_URL: BCN_URL } = import.meta.env
    playerWhite = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL })
    await playerWhite.wallet.restClient.faucet(playerWhite.getAddress(), 8e8)
    expect((await playerWhite.getBalance()).balance).toBeGreaterThan(0)

    playerBlack = playerWhite = new Computer({ chain: CHAIN, network: NETWORK, url: BCN_URL })
    await playerBlack.wallet.restClient.faucet(playerBlack.getAddress(), 8e8)
    expect((await playerBlack.getBalance()).balance).toBeGreaterThan(0)
  })

  it("White player can create a test payment and fund it", async () => {
    // Create a payment object, playerWhite and playerBlack are the owners but funded completely by playerWhite
    const payment = await playerWhite.new(TestPayment, [
      1e8,
      playerWhite.getPublicKey(),
      playerBlack.getPublicKey()
    ])
    const gameWhite = await playerWhite.new(Game, [
      playerWhite.getPublicKey(),
      playerBlack.getPublicKey()
    ])
    sleep(500)
    console.log("Before winner: ", await playerWhite.getBalance(), await playerBlack.getBalance())
    await gameWhite.setPayment(payment)
    // await gameWhite.setWinner("black")
    // sleep(500)
    // console.log("Winner is:", await gameWhite.getWinner(), await playerBlack.getPublicKey())
    // const paymentRev = await playerWhite.getLatestRev(payment._id)
    // const updatedPayment = await playerWhite.sync(paymentRev)
    // console.log({ updatedPayment })
    // sleep(500)
    // const gameRev = await playerWhite.getLatestRev(gameWhite._id)
    // const gameBlack = (await playerBlack.sync(gameRev)) as Game
    // await gameBlack.withdraw()
  })
})
