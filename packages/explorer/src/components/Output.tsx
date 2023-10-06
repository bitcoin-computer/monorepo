import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import Well from "./Well"

const keywords = ["_id", "_rev", "_owners", "_root", "_amount"]

function Output(props: { computer: Computer }) {
  const location = useLocation()
  const { computer } = props
  const params = useParams()
  const [rev] = useState(params.rev || '')
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [outputData, setOutputData] = useState<any | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setSmartObject(await computer.sync(rev))
        const string = `${rev?.split(":")[0]} ${rev?.split(":")[1]} true`
        const { result } = await computer.rpcCall("gettxout", string)
        setOutputData(result)
      } catch (error) {
        console.log('Error syncing to smart object', error)
      }
    }
    console.log('fetching')
    fetch()
  }, [computer, rev, location])

  const capitalizeFirstLetter = (string: string) =>  string.charAt(0).toUpperCase() + string.slice(1)

  const revToId = (rev: string) => rev?.split(':')[0]

//   const input = () => (<form>
//     <div className="flex mt-2 mb-4">
//        <label htmlFor="search-dropdown" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Your Email</label>
//        <button id="dropdown-button" data-dropdown-toggle="dropdown" className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-l-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600" type="button">
//           All categories 
//           <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
//              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
//           </svg>
//        </button>
//        <div id="dropdown" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
//           <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdown-button">
//              <li>
//                 <button type="button" className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mockups</button>
//              </li>
//              <li>
//                 <button type="button" className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Templates</button>
//              </li>
//              <li>
//                 <button type="button" className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Design</button>
//              </li>
//              <li>
//                 <button type="button" className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Logos</button>
//              </li>
//           </ul>
//        </div>
//        <div className="relative w-full">
//           <input type="search" id="search-dropdown" className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-r-lg border-l-gray-50 border-l-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-l-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500" placeholder="Search Mockups, Logos, Design Templates..." required />
//           <button type="submit" className="absolute top-0 right-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 rounded-r-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
//              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
//                 <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
//              </svg>
//              <span className="sr-only">Search</span>
//           </button>
//        </div>
//     </div>
//  </form>)

  return (<>
    <div className="pt-4">
      <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Output</h1>
      <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">{rev}</p>

      <h2 className="mb-2 text-4xl font-bold dark:text-white">Data</h2>

      {smartObject && Object.entries(smartObject).filter(([k]) => !keywords.includes(k)).map(([key, value], i) => {
        return (<div key={i}>
          <h3 className="mt-2 text-xl font-bold dark:text-white">{capitalizeFirstLetter(key)}</h3>
          {<Well content={JSON.stringify(value, null, 2)} />}          
        </div>)
      })}

      {/* <h2 className="mb-2 text-4xl font-bold dark:text-white">Functions</h2>

      <h3 className="mt-2 text-xl font-bold dark:text-white">AddStudent</h3>

      {input()} */}


      <h2 className="mb-2 text-4xl font-bold dark:text-white">Meta Data</h2>
          
      <h3 className="text-xl font-bold dark:text-white">Id</h3>
      <Link to={`/outputs/${smartObject?._id}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
        {smartObject?._id}
      </Link>

      <h3 className="text-xl font-bold dark:text-white">Revision</h3>
      <Link to={`/outputs/${smartObject?._rev}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
        {smartObject?._rev}
      </Link>

      <h3 className="text-xl font-bold dark:text-white">Root</h3>
      <Link to={`/outputs/${smartObject?._root}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
        {smartObject?._root}
      </Link> 

      <h3 className="text-xl font-bold dark:text-white">Transaction</h3>
      <Link to={`/transactions/${revToId(smartObject?._rev)}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
        {revToId(smartObject?._rev)}
      </Link>

      <h3 className="text-xl font-bold dark:text-white">Owners</h3>
        {smartObject?._owners}

      <h3 className="text-xl font-bold dark:text-white">Amount</h3>
        {smartObject?._amount}

      <h3 className="text-xl font-bold dark:text-white">Script</h3>
        {outputData?.scriptPubKey.asm}

      <h3 className="text-xl font-bold dark:text-white">Script Type</h3>
        {outputData?.scriptPubKey.type}
    </div>
  </>)
}

export default Output
