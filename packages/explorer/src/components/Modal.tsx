import { Dispatch, SetStateAction } from "react"
import { Link } from "react-router-dom"

function Modal(props: {
  show: boolean
  setShow: Dispatch<SetStateAction<boolean>>
  functionResult: any
  navigateToNewSmartObject: any
}) {
  const { show, setShow, functionResult, navigateToNewSmartObject } = props
  console.log(functionResult)
  const toggleShow = async (event: any) => {
    event.preventDefault()
    try {
      setShow(false)
      navigateToNewSmartObject()
    } catch (error) {
      console.log(error)
    }
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
          <div className="relative bg-white rounded-lg dark:bg-gray-700">
            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Result</h3>
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
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {typeof functionResult === "object" &&
                !Array.isArray(functionResult) &&
                functionResult._rev
                  ? "Function returned a smart object:"
                  : "Following is the result of function call:"}
              </p>
              <pre className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {typeof functionResult === "object" &&
                !Array.isArray(functionResult) &&
                functionResult._rev ? (
                  <>
                    <Link to={`/outputs/${functionResult._rev}`} className="hover:text-bit-blue">
                      {functionResult._rev}
                    </Link>
                  </>
                ) : functionResult ? (
                  functionResult.toString()
                ) : (
                  "No value returned"
                )}
              </pre>
            </div>
            {/* <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              <button
                data-modal-hide="defaultModal"
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                I accept
              </button>
              <button
                data-modal-hide="defaultModal"
                type="button"
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                Decline
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </>
  )
}

export default Modal
