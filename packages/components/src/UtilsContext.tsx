import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { SnackBar } from './SnackBar'
import { Loader } from './Loader'
import { checkGeoLocation } from './utils/geolocation'
import { Modal } from './Modal'

const errorGeolocationModal = 'error-geolocation'

function ErrorContent(msg: string) {
  return (
    <>
      <div className="p-4 md:p-5 dark:text-gray-400">
        <div>
          The app is not accessible from your location.
          <br />
          <br />
          {msg}
        </div>
      </div>
    </>
  )
}

interface UtilsContextProps {
  showSnackBar: (message: string, success: boolean) => void
  hideSnackBar: () => void
  showLoader: (show: boolean) => void
}

const utilsContext = createContext<UtilsContextProps | undefined>(undefined)

export const useUtilsComponents = (): UtilsContextProps => {
  const context = useContext(utilsContext)
  if (!context) {
    throw new Error('useUtilsComponents must be used within a UtilsProvider')
  }
  return context
}

// GeoLocationWrapper Component
function GeoLocationWrapper({ children }: { children: React.ReactNode }) {
  const [isValidLocation, setIsValidLocation] = useState<boolean | null>(null)
  const { showLoader } = useUtilsComponents()
  const isEnabled = import.meta.env.VITE_ENABLE_GEOLOCATION === 'true'

  useEffect(() => {
    const checkLocation = async () => {
      if (!isEnabled) {
        setIsValidLocation(true)
        return
      }

      try {
        showLoader(true)
        const isValid = await checkGeoLocation()
        setIsValidLocation(isValid)
      } catch (error) {
        setIsValidLocation(false)
      } finally {
        showLoader(false)
      }
    }

    checkLocation()
  }, [])

  if (isEnabled && isValidLocation === null) {
    return null
  }

  if (isEnabled && isValidLocation === false) {
    Modal.showModal(errorGeolocationModal)
    return null
  }

  return <>{children}</>
}

interface UtilsProviderProps {
  children: ReactNode
}

export const UtilsProvider: React.FC<UtilsProviderProps> = ({ children }) => {
  const [snackBar, setSnackBar] = useState<{ message: string; success: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const showSnackBar = (message: string, success: boolean) => {
    setSnackBar({ message, success })
  }

  const showLoader = (show: boolean) => {
    setIsLoading(show)
  }

  const hideSnackBar = () => {
    setSnackBar(null)
  }

  return (
    <utilsContext.Provider value={{ showSnackBar, hideSnackBar, showLoader }}>
      <GeoLocationWrapper>{children}</GeoLocationWrapper>
      {snackBar && (
        <SnackBar
          message={snackBar.message}
          success={snackBar.success}
          hideSnackBar={hideSnackBar}
        />
      )}
      {isLoading && <Loader />}
      <Modal.Component title={'Access Denied'} content={ErrorContent} id={errorGeolocationModal} />
    </utilsContext.Provider>
  )
}

export const UtilsContext = {
  UtilsProvider,
  useUtilsComponents,
}
