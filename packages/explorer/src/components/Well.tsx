import { Link } from "react-router-dom"
import reactStringReplace from 'react-string-replace';

function Well(props: { content: string }) {
  const { content } = props

  // const isRev = /^[0-9a-fA-F]{64}:[0-9]+$/
  // const revLink = (rev: string) => (<Link to={`/outputs/${rev}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{rev}</Link>)

  return (<pre className="mt-4 mb-8 p-6 overflow-x-auto leading-normal text-sm rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-blue-4">
      {content}
      {/* {reactStringReplace(content, /[0-9a-fA-F]{64}:[0-9]+/, (match, i) => (
        <span key={i} style={{ color: 'red' }}>{match}</span>
      ))} */}
  </pre>)
}

export default Well

