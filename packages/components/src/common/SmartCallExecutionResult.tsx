import { Link, useNavigate } from "react-router-dom"

export function FunctionResultModalContent({ functionResult }: any) {
  const navigate = useNavigate()
  const getType = (): string =>
    functionResult && functionResult?.type ? functionResult.type : "objects"

  return (
    <div>
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
        {typeof functionResult === "string" && (
          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            {functionResult}
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
                  smart object
                </Link>
              </>
            )}
        </pre>
      </div>
    </div>
  )
}
