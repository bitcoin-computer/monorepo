import { ComputerContext } from '@bitcoin-computer/components'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VITE_CHESS_GAME_MOD_SPEC } from '../constants/modSpecs'

type Class = new (...args: unknown[]) => unknown

type UserQuery<T extends Class> = Partial<{
  mod: string
  publicKey: string
  limit: number
  offset: number
  order: 'ASC' | 'DESC'
  ids: string[]
  contract: {
    class: T
    args?: ConstructorParameters<T>
  }
}>

export const InfiniteScroll = ({
  setGameId,
}: {
  setGameId: React.Dispatch<React.SetStateAction<string>>
}) => {
  const [items, setItems] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const computer = useContext(ComputerContext)
  const contractsPerPage = 12
  const navigate = useNavigate()

  const fetchMoreItems = useCallback(
    async <T extends Class>(q: UserQuery<T>): Promise<string[]> => {
      const query = { ...q }
      query.limit = contractsPerPage * 2 // For a chess game, we have two contracts: Payment and ChessContract
      query.order = 'DESC'
      const result = (await computer.query(query)) as string[]

      const filteredRevs = (result || []).filter((rev) => rev.split(':')[1] === '0')
      return filteredRevs
    },
    [contractsPerPage, computer],
  )

  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const newItems = await fetchMoreItems({ mod: VITE_CHESS_GAME_MOD_SPEC, offset: items.length })

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
      const initialItems = await fetchMoreItems({ mod: VITE_CHESS_GAME_MOD_SPEC, offset: 0 })
      setItems(initialItems)
      if (initialItems.length < contractsPerPage) setHasMore(false)
      setLoading(false)
    }

    initialFetch()
  }, [fetchMoreItems])

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white dark:bg-gray-800 border border-gray-300  dark:border-gray-700 rounded-lg">
      <div className="flex justify-center mt-2 mb-2">
        <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">All Games</h3>
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
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded shadow text-gray-800 dark:text-gray-200 truncate cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              title={item}
              onClick={() => {
                navigate(`/game/${item}`)
                setGameId(item)
              }}
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
