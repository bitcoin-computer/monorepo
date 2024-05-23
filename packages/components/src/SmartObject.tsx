import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import reactStringReplace from "react-string-replace"
import { capitalizeFirstLetter, toObject } from "./common/utils"
import { Card } from "./Card"
import { Modal } from "./Modal"
import { FunctionResultModalContent } from "./common/SmartCallExecutionResult"
import { SmartObjectFunction } from "./SmartObjectFunction"
import { ComputerContext } from "./ComputerContext"

const keywords = ["_id", "_rev", "_owners", "_root", "_amount"]
const modalId = "smart-object-info-modal"

export const getFnParamNames = function (fn: string) {
  const match = fn.toString().match(/\(.*?\)/)
  return match ? match[0].replace(/[()]/gi, "").replace(/\s/gi, "").split(",") : []
}

function ObjectValueCard({ content }: { content: string }) {
  const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g
  const revLink = (rev: string, i: number) => (
    <Link
      key={i}
      to={`/objects/${rev}`}
      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
    >
      {rev}
    </Link>
  )
  const formattedContent = reactStringReplace(content, isRev, revLink)

  return <Card content={formattedContent} />
}

const SmartObjectValues = ({ smartObject }: any) => {
  if (!smartObject) return <></>
  return (
    <>
      {Object.entries(smartObject)
        .filter(([k]) => !keywords.includes(k))
        .map(([key, value], i) => (
          <div key={i}>
            <h3 className="mt-2 text-xl font-bold dark:text-white">{capitalizeFirstLetter(key)}</h3>
            <ObjectValueCard content={toObject(value)} />
          </div>
        ))}
    </>
  )
}

function Component() {
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const [rev] = useState(params.rev || "")
  const computer = useContext(ComputerContext)
  const [smartObject, setSmartObject] = useState<any | null>(null)
  const [functionsExist, setFunctionsExist] = useState(false)
  const [functionResult, setFunctionResult] = useState<any>({})
  const options = ["object", "string", "number", "bigint", "boolean", "undefined", "symbol"]

  const [modalTitle, setModalTitle] = useState("")

  const setShow: any = (flag: boolean) => {
    if (flag) {
      Modal.get(modalId).show()
    } else {
      Modal.get(modalId).hide()
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const synced = await computer.sync(rev)
        setSmartObject(synced)
      } catch (error) {
        const [txId] = rev.split(":")
        navigate(`/transactions/${txId}`)
      }
    }
    fetch()
  }, [computer, rev, location, navigate])

  useEffect(() => {
    let funcExist = false
    if (smartObject) {
      const filteredSmartObject = Object.getOwnPropertyNames(
        Object.getPrototypeOf(smartObject)
      ).filter(
        (key) =>
          key !== "constructor" && typeof Object.getPrototypeOf(smartObject)[key] === "function"
      )

      Object.keys(filteredSmartObject).forEach((key) => {
        if (key) {
          funcExist = true
        }
      })
    }
    setFunctionsExist(funcExist)
  }, [smartObject])

  const [txId, outNum] = rev.split(":")

  return (
    <>
      <div>
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Object</h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          <Link
            to={`/transactions/${txId}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            {txId}
          </Link>
          :{outNum}
        </p>

        <SmartObjectValues smartObject={smartObject} />

        <SmartObjectFunction
          smartObject={smartObject}
          functionsExist={functionsExist}
          options={options}
          setFunctionResult={setFunctionResult}
          setShow={setShow}
          setModalTitle={setModalTitle}
        />

        {/* <MetaData smartObject={smartObject} /> */}
      </div>
      <Modal.Component
        title={modalTitle}
        content={FunctionResultModalContent}
        contentData={{ functionResult }}
        id={modalId}
      />
    </>
  )
}

export const SmartObject = {
  Component
}
