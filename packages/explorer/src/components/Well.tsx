import { Link } from "react-router-dom"
import reactStringReplace from 'react-string-replace';

const isRev = /([0-9a-fA-F]{64}:[0-9]+)/g
const revLink = (rev: string, i: number) => (<Link key={i} to={`/outputs/${rev}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{rev}</Link>)

export default function Well({ content }: { content: string }) {
  return (<pre className="mt-4 mb-8 p-6 overflow-x-auto leading-normal text-xs rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-blue-4">
      {reactStringReplace(content, isRev, revLink)}
  </pre>)
}
