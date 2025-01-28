export function Card({ content }: { content: string }) {
  return (
    <div className="block mt-4 mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <pre className="font-normal text-gray-700 dark:text-gray-400 text-xs">{content}</pre>
    </div>
  )
}
