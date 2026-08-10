import { Link, useNavigate } from 'react-router-dom'

export function FunctionResultModalContent({ functionResult }: any) {
  const navigate = useNavigate()

  if (functionResult && typeof functionResult === 'object' && !Array.isArray(functionResult)) {
    const isModule = functionResult.type === 'modules'
    const path = isModule ? `/modules/${functionResult._rev}` : `/objects/${functionResult._rev}`
    const label = isModule ? 'module' : 'on chain object'

    return (
      <>
        <div id="smart-call-execution-success" className="p-4 md:p-5 dark:text-gray-400">
          You created {isModule ? 'a' : 'an'}&nbsp;
          <Link
            id="smart-call-execution-counter-link"
            to={path}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              navigate(path)
              window.location.reload()
            }}
          >
            {label}
          </Link>
          .
        </div>
      </>
    )
  }

  if (functionResult._rev && functionResult.res.toString())
    return (
      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        You created the value below at Revision {functionResult._rev}
        <pre>{functionResult.res.toString()}</pre>
      </p>
    )

  return (
    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2">
      {functionResult}
    </p>
  )
}
