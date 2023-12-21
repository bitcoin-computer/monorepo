import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import Loader from "./Loader"
import { chunk, jsonMap, strip } from "../utils"
import { initFlowbite } from "flowbite"
import { explorerURL } from "../config"
import { HiRefresh } from "react-icons/hi"

function HomePageCard({ content }: { content: string }) {
  return (
    <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <pre className="font-normal text-gray-700 dark:text-gray-400 text-xs">{content}</pre>
    </div>
  )
}

function ValueComponent({ rev, computer }: { rev: string; computer: Computer }) {
  const [value, setValue] = useState("loading...")
  const [errorMsg, setMsgError] = useState("")

  useEffect(() => {
    const fetch = async () => {
      try {
        const synced = await computer.sync(rev)
        setValue(synced as any)
      } catch (err) {
        if (err instanceof Error) setMsgError(`Error: ${err.message}`)
      }
    }
    fetch()
  }, [computer, rev])

  if (errorMsg) <HomePageCard content={errorMsg} />

  return <HomePageCard content={JSON.stringify(jsonMap(strip as any)(value as any), null, 2)} />
}

function Gallery({ revs, computer }: { revs: string[]; computer: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 mt-4">
      {chunk(revs).map((chunk, i) => (
        <div key={chunk[0] + i} className="grid gap-4">
          {chunk.map((rev: string) => (
            <div key={rev}>
              <Link
                to={`${explorerURL}/objects/${rev}`}
                className="font-medium text-blue-600 dark:text-blue-500"
              >
                <ValueComponent rev={rev} computer={computer} />
              </Link>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Home(props: { computer: Computer }) {
  const { computer } = props
  const contractsPerPage = 5

  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()
  const publicKey = new URLSearchParams(location.search).get("public-key")
  const [balance, setBalance] = useState<number>(0)

  const [revs, setRevs] = useState<string[]>([])
  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        const queryParms: any = {
          offset: contractsPerPage * 0,
          limit: contractsPerPage,
        }
        if (publicKey) {
          queryParms["publicKey"] = publicKey
        }

        const queryRevs = await computer.query(queryParms)

        setRevs(queryRevs)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.log("Error loading revisions", error)
      }
    }
    fetch()
  }, [computer, revs.length, publicKey])

  useEffect(() => {
    async function refresh() {
      if (computer) setBalance(await computer.getBalance())
    }
    refresh()
    initFlowbite()
  }, [computer])

  const refreshBalance = async () => {
    try {
      if (computer) setBalance(await computer.getBalance())
    } catch (err) {
      console.log("Error fetching wallet details", err)
    }
  }

  return (
    <div className="relative sm:rounded-lg pt-4">
      <div className="mb-2 flex items-center">
        <h2 className="text-3xl font-bold dark:text-white">
          <span className="mr-1" style={{ color: "#0046FF" }}>
            {`${balance / 1e8} ${computer.getChain()}`}
          </span>
          <span className="text-sm mb-1">{`(${computer.getNetwork()})`}</span>
        </h2>
        <HiRefresh
          onClick={refreshBalance}
          className="ml-2 text-2xl inline text-gray-900 dark:text-gray-400 hover:text-slate-500 cursor-pointer"
        />
      </div>

      <button
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        data-drawer-target="drawer-transfer"
        data-drawer-show="drawer-transfer"
        aria-controls="drawer-transfer"
        data-drawer-placement="right"
      >
        Transfer
      </button>

      <button
        type="button"
        className="mt-4 text-white bg-green-500 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
        data-drawer-target="drawer-wallet"
        data-drawer-show="drawer-wallet"
        aria-controls="drawer-wallet"
        data-drawer-placement="right"
      >
        Wallet
      </button>

      <h2 className="mb-2 mt-2 text-2xl font-bold dark:text-white">Assets</h2>
      <Gallery revs={revs} computer={computer} />
      {isLoading && <Loader />}
    </div>
  )
}
