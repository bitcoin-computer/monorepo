import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function Modal(props: {
  show: boolean
  setShow: Dispatch<SetStateAction<boolean>>
  functionResult: any
  functionCallSuccess: boolean
}) {
  const { show, setShow, functionResult, functionCallSuccess } = props

  const navigate = useNavigate()
  const toggleShow = async (event: any) => {
    event.preventDefault()
    try {
      setShow(false)
    } catch (error) {
      console.log("Error navigating to smart object", error)
    }
  }

  const getType = (): string => {
    return functionResult && functionResult?.type ? functionResult.type : "objects"
  }
  return (
    <>
      <div
        id="defaultModal"
        tabIndex={-1}
        className={
          show
            ? "fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full inset-0 flex items-center place-items-center"
            : "hidden"
        }
      >
        <div className="relative w-full ml-60 mr-60 max-h-full">
          <div className="relative bg-white rounded-lg dark:bg-gray-700 border border-gray-300">
            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3>{functionCallSuccess ? "Success!!" : "Error!"}</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="defaultModal"
                onClick={(evt) => toggleShow(evt)}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {functionResult?.res && (
                <>
                  <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    Data returned:
                  </p>
                  <pre className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    {functionResult.res.toString()}
                  </pre>
                </>
              )}
              {typeof functionResult === "object" && functionResult && functionResult._rev && (
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  {"Check the latest state of your smart object by clicking the link below"}
                </p>
              )}
              <pre className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {typeof functionResult === "object" &&
                  !Array.isArray(functionResult) &&
                  functionResult._rev && (
                    <>
                      <Link
                        to={`/${getType()}/${functionResult._rev}`}
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        onClick={() => {
                          navigate(`/${getType()}/${functionResult._rev}`)
                          window.location.reload()
                        }}
                      >
                        {functionResult._rev}
                      </Link>
                    </>
                  )}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Modal
