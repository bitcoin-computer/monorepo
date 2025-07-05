import { useState, useEffect, useRef } from 'react'

function ShowDrawer({ text, id }: { text: string; id: string }) {
  return (
    <button
      data-drawer-target={id}
      data-drawer-show={id}
      data-drawer-placement="right"
      aria-controls={id}
    >
      {text}
    </button>
  )
}

function Component({
  Content,
  id,
}: {
  Content: (props: { isOpen: boolean }) => JSX.Element
  id: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const drawerElement = drawerRef.current
    if (drawerElement) {
      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.propertyName === 'transform')
          setIsOpen(!drawerElement.classList.contains('translate-x-full'))
      }

      drawerElement.addEventListener('transitionend', onTransitionEnd as EventListener)

      return () => {
        drawerElement.removeEventListener('transitionend', onTransitionEnd as EventListener)
      }
    }
    return undefined
  }, [])

  return (
    <div
      ref={drawerRef}
      id={id}
      className="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform duration-300 translate-x-full bg-white w-80 dark:bg-gray-800"
      tabIndex={-1}
      aria-labelledby="drawer-right-label"
    >
      <button
        type="button"
        data-drawer-hide={id}
        aria-controls={id}
        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
      >
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
        <span className="sr-only">Close menu</span>
      </button>
      {Content({ isOpen })}
    </div>
  )
}

export const Drawer = {
  Component,
  ShowDrawer,
}
