import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

function Mint({ computer, nftModSpec }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState("Apes in the Orange Grove")
  const [artist, setArtist] = useState("Henri Rousseau")
  const [url, setUrl] = useState(
    "https://uploads1.wikiart.org/images/henri-rousseau/apes-in-the-orange-grove.jpg!Large.jpg"
  )
  const [royalty, setRoyalty] = useState(0.1)

  const handleMissing = (s) => {
    console.log(`Provide valid ${s}.`)
    return
  }

  const mintNft = async (evt) => {
    evt.preventDefault()
    try {
      if (!title) return handleMissing("title")
      if (!artist) return handleMissing("artist")
      if (!url) return handleMissing("url")

      const creator = computer.getPublicKey()
      const exp = `new NFT('${title}', '${artist}', '${url}', '${creator}', ${royalty})`
      const { tx } = await computer.encode({ exp, mod: nftModSpec })
      const txId = await computer.broadcast(tx)
      const nft = await computer.sync(`${txId}:0`)
      console.log("Minted NFT: ", nft)
      navigate(`../../nfts?${new URLSearchParams({ publicKey: computer.getPublicKey() }).toString()}`)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 h-96">
        <div className="sm:mx-auto sm:w-full pl-10 pr-10">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <h1 className="font-bold text-3xl ">Mint NFT</h1>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border grid place-items-center">
              {url && <img className="h-auto w-full" src={url} alt="NFT" />}
            </div>
            <div>
              <form onSubmit={mintNft}>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required={true}
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  />
                  <label
                    htmlFor="title"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Title
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="artist"
                    id="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required={true}
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  />
                  <label
                    htmlFor="artist"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Artist
                  </label>
                </div>

                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="repeat_password"
                    id="floating_repeat_password"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required={true}
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  />
                  <label
                    htmlFor="floating_repeat_password"
                    className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    URL
                  </label>
                </div>

                <div className="grid md:grid-cols-2 md:gap-6">
                  <div className="relative z-0 w-full mb-6 group">
                    <input
                      type="text"
                      name="royalty"
                      id="royalty"
                      value={royalty}
                      onChange={(e) => setRoyalty(e.target.value)}
                      required={true}
                      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    />
                    <label
                      htmlFor="royalty"
                      className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                    >
                      Royalty
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mint
