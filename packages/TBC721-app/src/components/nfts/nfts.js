import React, { useState, useEffect } from "react"
import Loader from "../util/loader"
import NftCard from "./nftCard"
import { useLocation } from "react-router-dom"


function Nfts({ computer, nftMod }) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const publicKey = searchParams.get('publicKey')
  const nftsPerPage = 4

  const [revs, setRevs] = useState(null)
  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(true)
  const [isPrevAvailable] = useState(pageNum > 0)

  useEffect(() => {
    const fetch = async () => {
      try {
        if (computer) {
          setRevs(await computer.query({
            mod: nftMod,
            ...(publicKey ? { publicKey } : {}),
            offset: nftsPerPage * pageNum,
            limit: nftsPerPage + 1,
          }))
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetch()
  }, [])

  const handleNext = async () => {
    setPageNum(pageNum + 1)
  }

  const handlePrev = async () => {
    setIsNextAvailable(true)
    setPageNum(pageNum - 1)
  }

  const Title = () => {
    if(!publicKey) return (<></>)
    return (<div className="ml-4 text-2xl font-bold">
      User&nbsp;<span className="text-grey2">{publicKey}</span>
    </div>)
  }

  const NftGrid = ({ computer }) => {
    if (!revs) return <Loader />
    if (revs.length === 0) return (
      <div className="ml-4">
        <div className="h-60"></div>
        <div className="text-center">Click mint to create the first NFT</div>
        <div className="h-60"></div>
      </div>
    )
    return (<div className="grid grid-cols-1">
      <div className="flex flex-wrap">
        {revs.map((rev) => (
          <NftCard computer={computer} rev={rev} key={rev} />
        ))}
      </div>
    </div>
    )
  }

  const Pagination = () => (<nav className="h-20">
    <ul className="flex justify-center pt-1 ">
      <li>
        <button
          disabled={!isPrevAvailable}
          onClick={handlePrev}
          className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          Prev
        </button>
      </li>
      <li>
        <button
          disabled={!isNextAvailable}
          onClick={handleNext}
          className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          Next
        </button>
      </li>
    </ul>
  </nav>)

  return (<>
    <Title />
    <NftGrid computer={computer}/>
    <Pagination />
  </>)
}

export default Nfts
