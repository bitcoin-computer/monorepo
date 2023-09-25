import { config } from "dotenv"
import { Computer } from "@bitcoin-computer/lib"
import readline from "readline"

config()

const mnemonic = process.env.MNEMONIC
const chain = process.env.CHAIN || "LTC"
const network = process.env.NETWORK || "regtest"
const url = process.env.BCN_URL || "http://127.0.0.1:3000"

if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file")
}

const computer = new Computer({ mnemonic, chain, network, url })

// Prompt the user to confirm an action
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const balance = await computer.wallet.getBalance()

// Summary
console.log(`
Chain \x1b[2m${chain}\x1b[0m
Network \x1b[2m${network}\x1b[0m
Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.wallet.address}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance / 1e8}\x1b[0m
`)

const q = `
Do you want to deploy the contracts? (y/n)
`
rl.question(q, async (answer) => {
  if (answer === "y") {
    console.log("\n  Deploying contracts...")

    try {
      /**
       * Contract #1
       * single property and single method
       */
      class Counter extends Contract {
        constructor() {
          super({ n: 5, names: ["A", "B", "C"] })
        }
        inc(m) {
          this.n += m
        }
      }
      await computer.new(Counter)

      /**
       * Contract #2
       * multiple properties
       */
      class A extends Contract {
        constructor(n, s) {
          super({ n, s })
        }

        newSmartObject(val, name) {
          return new A(val, name)
        }
      }
      const a = await computer.new(A, [Math.random(), "C"])

      /**
       * Contract #3
       * Contract takes another smart contract as param and access its method
       */
      class B extends Contract {
        constructor() {
          super({ name: "b" })
        }

        setName(name) {
          this.name = name
          return this.name
        }
      }

      await computer.new(B, [])

      /**
       * Contract #4
       * simple contract with hardcoded params
       */
      class D extends Contract {
        constructor(n) {
          super({ n, _url: "http://127.0.0.1:3000" })
        }

        inc(n) {
          this.n += n
          return this.n
        }
      }
      await computer.new(D, [2])

      /**
       * Contract #5
       * Takes another contract as param and sets it's own method as well
       */
      class E extends Contract {
        constructor(a) {
          super({ a: a, test: "", age: 0, value: 0 })
        }
        setTest(test, age, value) {
          this.test = test
          this.age = age
          this.value = value
        }
      }
      const e = await computer.new(E, [a])
      await e.setTest("testing", 27, 100)
      console.log(`Contracted deployed successfully`)
    } catch (error) {
      console.log("error occurred while deploying contracts", error)
    }
  } else {
    console.log("Aborting...")
  }
  rl.close()
})
