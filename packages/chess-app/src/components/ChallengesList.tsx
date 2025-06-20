import { ComputerContext, Modal } from '@bitcoin-computer/components'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { HiRefresh } from 'react-icons/hi'
import { VITE_CHESS_CHALLENGE_MOD_SPEC } from '../constants/modSpecs'
import { startGameModal } from './StartGame'

export const ChallengeList = ({
  challenges,
  setChallenges,
  setChallengeId,
}: {
  challenges: string[]
  setChallenges: React.Dispatch<React.SetStateAction<string[]>>
  setChallengeId: React.Dispatch<React.SetStateAction<string>>
}) => {
  const [items, setItems] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const computer = useContext(ComputerContext)
  const itemsPerPage = 12

  const fetchMoreItems = useCallback(
    async (offset: number): Promise<string[]> => {
      return challenges ? challenges.slice(offset, offset + itemsPerPage) : []
    },
    [itemsPerPage, challenges],
  )

  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const newItems = await fetchMoreItems(items.length)

    setItems((prev) => [...prev, ...newItems])
    if (newItems.length < itemsPerPage) setHasMore(false) // Stop fetching when no more items are available
    setLoading(false)
  }, [loading, hasMore, items, fetchMoreItems])

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      const bottomReached = container.scrollTop + container.clientHeight >= container.scrollHeight
      if (bottomReached) {
        loadMoreItems()
      }
    }
  }

  useEffect(() => {
    // Initial fetch without relying on scroll
    const initialFetch = async () => {
      setLoading(true)
      const initialItems = await fetchMoreItems(0)
      setItems(initialItems)
      if (initialItems.length < itemsPerPage) setHasMore(false)
      setLoading(false)
    }

    initialFetch()
  }, [fetchMoreItems])

  const refreshList = async () => {
    const challengeRevs = await computer.query({
      mod: VITE_CHESS_CHALLENGE_MOD_SPEC,
      publicKey: computer.getPublicKey(),
    })
    setChallenges(challengeRevs.reverse())
  }

  const openModal = (item: string) => {
    setChallengeId(item)
    Modal.showModal(startGameModal)
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white dark:bg-gray-800 border border-gray-300  dark:border-gray-700 rounded-lg">
      <div className="flex justify-center mt-2 mb-2">
        <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">
          <span className="hover:text-gray-700 dark:hover:text-gray-200 font-extrabold cursor-pointer">
            My Challenges
          </span>{' '}
          <HiRefresh
            onClick={refreshList}
            className="w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
          />
        </h3>
      </div>
      <div
        ref={scrollContainerRef}
        className="overflow-auto flex-1   max-h-[calc(100vh-9rem)]"
        onScroll={handleScroll}
      >
        <ul className="space-y-2 p-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded shadow text-gray-800 dark:text-gray-200 truncate cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              title={item}
              onClick={() => openModal(item)}
            >
              {item}
            </li>
          ))}
        </ul>
        {loading && (
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">Loading...</div>
        )}
      </div>
    </div>
  )
}
