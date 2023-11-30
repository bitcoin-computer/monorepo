import { Link, useNavigate } from "react-router-dom"

export const Modal = ({
  customElement,
  show,
  setShow,
  functionResult,
  functionCallSuccess,
}: any) => {
  const navigate = useNavigate()
  const getType = (): string => {
    return functionResult && functionResult?.type ? functionResult.type : "objects"
  }
  return (
    <>
      {show && (
        <div
          tab-index="-1"
          aria-hidden="true"
          className="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div className="relative p-4 w-full max-w-4xl max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {functionCallSuccess ? "Success!!" : "Error!"}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => setShow(false)}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-4 md:p-5 space-y-4">
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
                {customElement ? customElement : <></>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
