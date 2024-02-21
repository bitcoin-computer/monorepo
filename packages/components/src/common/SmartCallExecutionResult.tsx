import { Link, useNavigate } from "react-router-dom"

export function FunctionResultModalContent({ functionResult }: any) {
  const navigate = useNavigate()

  if (functionResult && typeof functionResult === "object" && !Array.isArray(functionResult))
    return <>
      <div className="p-4 md:p-5">  
        You created a&nbsp;
        <Link
          to={`/objects/${functionResult._rev}`}
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          onClick={() => {
            navigate(`/objects/${functionResult._rev}`)
            window.location.reload()
          }}
        >
          smart object
        </Link>.
      </div>
    </>
  
  return <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
      You created the value below at Revision {functionResult._rev}
      <pre>
        {functionResult.res.toString()}
      </pre>
    </p>
}
