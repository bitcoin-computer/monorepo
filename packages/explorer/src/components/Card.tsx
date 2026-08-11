export function Card({ content }: { content: string }) {
  return (
    <div className="block mt-1.5 mb-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <pre className="font-normal text-gray-700 dark:text-gray-400 text-xs whitespace-pre-wrap break-words">
        {content}
      </pre>
    </div>
  )
}
