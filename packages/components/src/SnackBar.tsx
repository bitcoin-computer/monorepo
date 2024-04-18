import { useEffect } from "react"

interface SnackBarProps {
  message: string
  success: boolean
  hideSnackBar: () => void
}

export function SnackBar(props: SnackBarProps) {
  const { message, success, hideSnackBar } = props

  const closeMessage = (evt: any) => {
    evt.preventDefault()
    hideSnackBar()
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      hideSnackBar()
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [hideSnackBar])

  return (
    <div
      className={
        success
          ? `bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded fixed bottom-2 right-2 z-50`
          : `bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed bottom-2 right-2 z-50`
      }
      role="alert"
    >
      <strong className="font-bold pr-6">{message}</strong>
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={closeMessage}>
        <svg
          className={
            success ? `fill-current h-6 w-6 text-green-500` : `fill-current h-6 w-6 text-red-500`
          }
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
        </svg>
      </span>
    </div>
  )
}
