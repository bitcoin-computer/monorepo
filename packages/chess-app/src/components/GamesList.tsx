import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiRefresh } from 'react-icons/hi'

export type GameType = {
  gameId: string
  new: boolean
}

export const InfiniteScroll = ({
  setGameId,
  games,
  refreshGames,
}: {
  setGameId: React.Dispatch<React.SetStateAction<string>>
  games: GameType[]
  refreshGames: () => Promise<void>
}) => {
  const [items, setItems] = useState<GameType[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const contractsPerPage = 12
  const navigate = useNavigate()

  const fetchMoreItems = useCallback(
    async (offset: number): Promise<GameType[]> => {
      return games ? games.slice(offset, offset + contractsPerPage) : []
    },
    [contractsPerPage, games],
  )

  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const newItems = await fetchMoreItems(items.length)

    setItems((prev) => [...prev, ...newItems])
    if (newItems.length < contractsPerPage) setHasMore(false) // Stop fetching when no more items are available
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
      if (initialItems.length < contractsPerPage) setHasMore(false)
      setLoading(false)
    }

    initialFetch()
  }, [fetchMoreItems])

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white dark:bg-gray-800 border border-gray-300  dark:border-gray-700 rounded-lg">
      <div className="flex justify-center mt-2 mb-2">
        <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">
          <span className="hover:text-gray-700 dark:hover:text-gray-200 font-extrabold cursor-pointer">
            My Games
          </span>{' '}
          <HiRefresh
            onClick={refreshGames}
            className="w-4 h-4 ml-1 mb-1 inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
          />
        </h3>
      </div>
      <div
        ref={scrollContainerRef}
        className="overflow-auto flex-1   max-h-[calc(100vh-9rem)]"
        // style={{ maxHeight: '500px' }}
        onScroll={handleScroll}
      >
        <ul className="space-y-2 p-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="relative p-2 bg-gray-100 dark:bg-gray-700 rounded shadow text-gray-800 dark:text-gray-200 truncate cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              title={item.gameId}
              onClick={() => {
                navigate(`/game/${item.gameId}`)
                setGameId(item.gameId)
              }}
            >
              {item.gameId}
              {item.new && (
                <div className="absolute inline-flex w-3 h-3 bg-red-500 rounded-full top-0 end-0 -mt-1 -mr-1"></div>
              )}
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
