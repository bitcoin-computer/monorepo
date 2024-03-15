import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { capitalizeFirstLetter } from '../utils'
import { Card } from './Card'
import { Auth, UtilsContext } from '@bitcoin-computer/components'

function Module() {
  const [computer] = useState(Auth.getComputer())
  const params = useParams()
  const [modSpec] = useState(params.rev)
  const [module, setModule] = useState<any>({})
  const { showSnackBar } = UtilsContext.useUtilsComponents()

  useEffect(() => {
    const fetch = async () => {
      try {
        setModule(await computer.load(modSpec as string))
      } catch (error) {
        showSnackBar('Error fetching module object', false)
        console.log('Error fetching module object', error)
      }
    }
    fetch()
  })

  return (
    <>
      <div className="pt-4 w-full relative">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">Module</h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          {modSpec}
        </p>
        {module && Object.getOwnPropertyNames(module) && (
          <>
            {Object.getOwnPropertyNames(module).map((key: string) => (
              <div key={key}>
                <h2 className="mb-2 text-4xl font-bold dark:text-white">
                  {capitalizeFirstLetter(key)}
                </h2>
                <Card content={module[key].toString()} />
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}

export default Module
