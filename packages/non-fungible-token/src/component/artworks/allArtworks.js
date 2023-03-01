import React, { useState, useEffect } from "react"
import Loader from "../util/loader"
import Artworks from "./artworks"
import { useNavigate, useParams } from "react-router-dom"

function AllArtworks({ computer, nftMod }) {
  const navigate = useNavigate()
  let params = useParams()
  const [publicKey] = useState(params.publicKey)
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")

  const [pageNum, setPageNum] = useState(0)
  const [isNextAvailable, setIsNextAvailable] = useState(true)
  const [isPrevAvailable, setIsPrevAvailable] = useState(pageNum > 0)

  const artsPerPage = 4

  useEffect(() => {
    const fetch = async () => {
      // todo: investigate why this is evaluated twice
      try {
        const myPage = computer && publicKey === computer.getPublicKey()
        if(myPage) setTitle("My Art")
        if(!myPage && publicKey) setTitle("Art Found")
        if(!myPage && !publicKey) setTitle("All Art")

        setLoading(true)
        if (computer) {
          const revs = await computer.query({
            mod: nftMod,
            ...publicKey ? { publicKey } : {},
            limit: artsPerPage + 1,
            offset: pageNum * artsPerPage,
          })
          setArtworks(await Promise.all(revs.map((rev) => computer.sync(rev))))
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
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

  return (
    <div className="mt-28">
      <div className="grid grid-cols-1 pl-10 pr-10 h-120">
        <div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex flex-row">
              <h1 className="font-bold text-3xl">{title}</h1>
            </div>
            <nav className="h-20">
              <ul className="flex justify-end pt-1 ">
                <li>
                  <button
                    disabled={!isPrevAvailable}
                    onClick={handlePrev}
                    className="py-2 w-16 mr-4 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-slate-400"
                  >
                    Prev
                  </button>
                </li>
                <li>
                  <button
                    disabled={!isNextAvailable}
                    onClick={handleNext}
                    className="py-2 w-16 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-slate-400"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          {loading ? <Loader /> : <Artworks artworks={artworks}/>}
        </div>
      </div>
    </div>
  )
}

export default AllArtworks
