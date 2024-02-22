import React, { useEffect, useState } from "react"
import { GrClose, GrRefresh } from "react-icons/gr"
import { FaCopy } from "react-icons/fa"

export default function Wallet({ computer, isOpen, setIsOpen }) {
  const [message, setMessage] = useState("")
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    (async () => {
      await refreshBalance()
    })()
  }, [])

  const refreshBalance = async () => {
    try {
      if (computer) setBalance(await computer.getBalance())
    } catch (err) {
      console.log(err)
      console.log("error occurred while fetching wallet details: ", err)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(computer.getAddress().toString())
  }

  const copyKey = () => {
    navigator.clipboard.writeText(computer.getPublicKey().toString())
  }
  return (
    <main
      className={
        " mt-20 fixed overflow-hidden z-10 bg-gray-900 bg-opacity-25 inset-0 transform ease-in-out " +
        (isOpen
          ? " transition-opacity opacity-100 duration-500 translate-x-0 "
          : " transition-all delay-500 opacity-0 translate-x-full ")
      }
    >
      <section
        className={
          " w-screen max-w-md right-0 absolute bg-white h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform  " +
          (isOpen ? " translate-x-0 " : " translate-x-full ")
        }
      >
        <article className="relative w-screen max-w-md pb-10 flex flex-col space-y-6 overflow-y-scroll h-full">
          <div className="flex flex-row-reverse w-full mb-2">
            <GrClose
              onClick={() => { setIsOpen(false) }}
              className="justify-end text-2xl mt-4 mr-4 hover:text-slate-500 cursor-pointer"
            ></GrClose>
          </div>
          <div className="p-4 w-full mt-4">
            <div className="mb-4 text-md font-bold text-gray-700">
              Balance
            </div>
            <div className="flex flex-row place-items-center justify-center dark:text-black">
              <span className=" text-center text-xl font-mono">
                {balance / 1e8}
              <span className="text-xl ml-2">LTC</span>
              </span>
              <GrRefresh
                onClick={refreshBalance}
                className=" text-xl ml-4 hover:text-slate-500 cursor-pointer"
              ></GrRefresh>
            </div>
          </div>
          <div className="mt-1">
            <div className="ml-4">
              <span className="font-bold">Address</span><br />
              <span className="ml-6 font-mono">
                {computer ? computer.getAddress() : ''}
              </span>
              {/* <FaCopy
                onClick={copyAddress}
                className="text pl-2 hover:text-slate-500 cursor-pointer"
              ></FaCopy> */}
            </div>
          </div>
          <div className="ml-4">
              <span className="font-bold">Public Key</span><br />
              <span className="ml-6">
                {computer ? computer.getPublicKey() : ''}
              </span>
              {/* <FaCopy
                onClick={copyKey}
                className="pl-2 hover:text-slate-500 cursor-pointer"
              ></FaCopy> */}
            </div>
        </article>
      </section>
      <section
        className=" w-screen h-full cursor-pointer "
        onClick={() => {
          setIsOpen(false)
        }}
      ></section>
    </main>
  )
}
