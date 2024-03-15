import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '@bitcoin-computer/components'
import { isValidHexadecimalPublicKey } from '../utils'

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null)

  const [computer] = useState(Auth.getComputer())
  const navigate = useNavigate()

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      search(inputRef?.current?.value)
    }
  }

  const search = async (searchInput: string | undefined) => {
    if (searchInput) {
      if (searchInput === '') navigate('/')
      else if (searchInput.includes(':')) {
        try {
          await computer.load(searchInput)
          navigate(`/modules/${searchInput}`)
        } catch (error) {
          navigate(`/objects/${searchInput}`)
        }
      } else if (isValidHexadecimalPublicKey(searchInput))
        navigate(`/?public-key=${searchInput.trim()}`)
      else navigate(`/transactions/${searchInput}`)
    }
  }

  return (
    <input
      ref={inputRef}
      onKeyDown={handleSearch}
      type="text"
      id="search-navbar"
      className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="Search..."
    />
  )
}
