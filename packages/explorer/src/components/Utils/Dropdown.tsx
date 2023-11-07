import { useState } from "react"

interface DropdownProps {
  onSelectMethod: (option: string) => void
}

const Dropdown = (props: DropdownProps) => {
  const { onSelectMethod } = props
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [selectedOption, setSelectedOption] = useState("String")
  const options = ["String", "Number", "Boolean", "Undefined", "NULL"]

  const handleMouseEnter = () => {
    setIsDropdownVisible(true)
  }

  const handleMouseLeave = () => {
    setIsDropdownVisible(false)
  }

  const handleOptionClick = (option: string) => {
    setSelectedOption(option)
    setIsDropdownVisible(false)
    onSelectMethod(option.toLocaleLowerCase())
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="text-gray-900 border border-gray-200 bg-white w-36 bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 inline-flex items-center justify-between hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white  dark:hover:bg-gray-700"
        type="button"
      >
        <span>{selectedOption}</span>
        <svg
          className="w-2.5 h-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {isDropdownVisible && (
        <div
          className="z-10 absolute left-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            {options.map((option, index) => (
              <li key={index}>
                <span
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover-bg-gray-600 dark:hover-text-white"
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Dropdown
