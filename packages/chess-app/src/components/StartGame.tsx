import { useState } from 'react'
import { Modal } from '@bitcoin-computer/components'

export const startGameModal = 'start-game-modal'

export function StartGameModalContent({
  copied,
  setCopied,
  link,
}: {
  copied: boolean
  setCopied: React.Dispatch<React.SetStateAction<boolean>>
  link: string
}) {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-start border rounded-lg shadow-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-700">
      <div className="relative group w-full p-6 border-b border-gray-200 dark:border-gray-600">
        <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
          You can find your game URL at the link below. Please share this URL with the white player.
        </p>
        <a
          href={link}
          className="text-sm text-blue-600 underline cursor-pointer truncate hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 focus:ring-0"
          title={link}
        >
          {`${link.slice(0, 40)}...`}
        </a>
      </div>

      <div className="p-6">
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}

export function StartGameModal({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Modal.Component
      title={'You can now start playing'}
      content={StartGameModalContent}
      contentData={{
        copied,
        setCopied,
        link,
      }}
      id={startGameModal}
    />
  )
}
