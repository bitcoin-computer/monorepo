import { Computer } from "@bitcoin-computer/lib"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { getFnParamNames } from "../utils"
import Modal from "./Modal"

const keywords = ["_id", "_rev", "_owners", "_root", "_amount"]

function Output(props: { computer: Computer }) {
  const navigate = useNavigate()

  const location = useLocation()
  const { computer } = props
  const params = useParams()
  const [rev] = useState(params.rev || '')
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [outputData, setOutputData] = useState<any | null>(null)
  const [formState, setFormState] = useState<any>({})
  const [smartObjectsExist, setSmartObjectsExist] = useState(false)
  const [propertiesExist, setPropertiesExist] = useState(false)
  const [functionsExist, setFunctionsExist] = useState(false)
  const [show, setShow] = useState(false)
  const [functionResult, setFunctionResult] = useState<any>({})

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
    fetch()
  }, [computer, rev, location])

  return (
    <>
        <div className="pt-4">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Output</h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">{rev}</p>

        <h2 className="mb-2 text-4xl font-bold dark:text-white">Data</h2>

        {/* {console.log(JSON.stringify(smartObject, null, 2))} */}

        {smartObject && Object.entries(smartObject).filter(([k]) => !keywords.includes(k)).map(([key, value]) => {
          // console.log('key', key, 'value', value)
          return (<>
            <h3 className="text-xl font-bold dark:text-white">{key}</h3>
            {JSON.stringify(value, null, 2)}          
          </>
          )
        })}

        <h2 className="mb-2 text-4xl font-bold dark:text-white">Functions</h2>


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

        <h3 className="text-xl font-bold dark:text-white">Owners</h3>
          {smartObject?._owners}

        <h3 className="text-xl font-bold dark:text-white">Amount</h3>
          {smartObject?._amount}

        <h3 className="text-xl font-bold dark:text-white">Script</h3>
          {outputData?.scriptPubKey.asm}

        <h3 className="text-xl font-bold dark:text-white">Script Type</h3>
          {outputData?.scriptPubKey.type}
      </div>
    </>
  )
}

export default Output
