import { Dropdown, initFlowbite } from 'flowbite'
import type { DropdownOptions, DropdownInterface, InstanceOptions } from 'flowbite'
import { useEffect, useState } from 'react'

export const TypeSelectionDropdown = ({
  id,
  onSelectMethod,
  dropdownList,
  selectedType,
}: {
  id: string
  onSelectMethod: (option: string) => void
  dropdownList: string[]
  selectedType: string
}) => {
  const [dropDown, setDropdown] = useState<DropdownInterface>()
  const [type, setType] = useState(selectedType || 'Type')
  const [dropdownSelectionList] = useState(dropdownList)

  useEffect(() => {
    initFlowbite()
    const $targetEl: HTMLElement = document.getElementById(`dropdownMenu${id}`) as HTMLElement
    const $triggerEl: HTMLElement = document.getElementById(`dropdownButton${id}`) as HTMLElement
    const options: DropdownOptions = {
      placement: 'bottom',
      triggerType: 'click',
      offsetSkidding: 0,
      offsetDistance: 10,
      delay: 300,
    }
    const instanceOptions: InstanceOptions = {
      id: `dropdownMenu${id}`,
      override: true,
    }
    setDropdown(new Dropdown($targetEl, $triggerEl, options, instanceOptions))
  }, [id])

  const handleClick = (t: string) => {
    setType(t)
    onSelectMethod(t)
    if (dropDown) dropDown.hide()
  }

  return (
    <>
      <button
        id={`dropdownButton${id}`}
        data-dropdown-toggle={`dropdownMenu${id}`}
        className="flex justify-between w-32 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        type="button"
      >
        {type}
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
          ></path>
        </svg>
      </button>

      <div
        id={`dropdownMenu${id}`}
        className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby={`dropdownButton${id}`}
        >
          {dropdownSelectionList.map((option: string, index: number) => (
            <li key={index}>
              <span
                onClick={() => {
                  handleClick(option)
                }}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {option}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
