import { config } from "dotenv"
import { Computer, Contract } from "@bitcoin-computer/lib"
import readline from "readline"

config()

const mnemonic = process.env.MNEMONIC
const chain = process.env.CHAIN || "LTC"
const network = process.env.NETWORK || "regtest"
const url = process.env.BCN_URL || "http://127.0.0.1:1031"

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
Node Url \x1b[2m${url}\x1b[0m
Address \x1b[2m${computer.wallet.address}\x1b[0m
Mnemonic \x1b[2m${mnemonic}\x1b[0m
Balance \x1b[2m${balance.balance / 1e8}\x1b[0m
`)

const q = `
Do you want to deploy the contracts? (y/n)
`
rl.question(q, async (answer) => {
  if (answer !== "n") {
    try {
      console.log("Deploying User contract...")
      class User extends Contract {
        constructor(firstName, lastName) {
          super({ firstName, lastName })
        }
      }

      console.log("Creating user Satoshi Nakamoto")
      const satoshi = await computer.new(User, ["Satoshi", "Nakamoto"])

      console.log("Creating user Alan Turing")
      const alan = await computer.new(User, ["Alan", "Turing"])

      console.log("Creating user Peter Landin")
      const peter = await computer.new(User, ["Peter", "Landin"])

      console.log("Deploying Course contract...")
      class Course extends Contract {
        constructor(name, instructor) {
          super({ name, instructor, students: [] })
        }

        addStudent(student) {
          this.students.push(student)
        }
      }

      console.log("Creating course on operational semantics with instructor Peter Landin")
      const course = await computer.new(Course, ["Operational Semantics", peter])

      console.log("Adding student Alan Turing")
      await course.addStudent(alan)

      // console.log("Adding student Satoshi Nakamoto")
      // await course.addStudent(satoshi)

      // class CourseExtended extends Contract {
      //   constructor(name, longStringPropertyForContract, instuctor) {
      //     super({ name, instuctor, longStringPropertyForContract, capacity: 0, students: [] })
      //   }

      //   updateCourseDetails(name, capacity) {
      //     this.name = name
      //     this.capacity = capacity
      //   }

      //   updateNameAndStringProp(name, longStringPropertyForContract) {
      //     this.name = name
      //     this.longStringPropertyForContract = longStringPropertyForContract
      //   }

      //   addStudent(student) {
      //     this.students.push(student)
      //   }
      // }
      // console.log("Creating test contract with multiple methods")
      // const courseExtended = await computer.new(CourseExtended, ["Bitcoin Computer", "some random value", peter])

      // console.log("Adding student to extended course", courseExtended)
      // await courseExtended.addStudent(alan)
    } catch (err) {
      console.log(err)
    }

    console.log(`\nSuccessfully created smart objects`)
  } else {
    console.log("Aborting...")
  }
  rl.close()
})
