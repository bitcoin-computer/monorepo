import { useContext, useState } from 'react'
import { ComputerContext, Modal, UtilsContext } from '@bitcoin-computer/components'
import { Computer } from '@bitcoin-computer/lib'
import { User, UserHelper } from '@bitcoin-computer/chess-contracts'
import { VITE_CHESS_USER_MOD_SPEC } from '../constants/modSpecs'

export const creaetUserModal = 'create-user-modal'

export function CreateUserModalContent({
  userTxId,
  setUserTxId,
  computer,
  setUserName,
  userName,
  setUser,
}: {
  userTxId: string
  setUserTxId: React.Dispatch<React.SetStateAction<string>>
  computer: Computer
  userName: string
  setUserName: React.Dispatch<React.SetStateAction<string>>
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}) {
  const { showLoader, showSnackBar } = UtilsContext.useUtilsComponents()

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      const userHelper = new UserHelper({ computer, mod: VITE_CHESS_USER_MOD_SPEC })
      const txId = await userHelper.createUser(userName)
      const [rev] = await computer.query({ ids: [txId + ':0'] })
      // Should there be delay here
      const user = (await computer.sync(rev)) as User
      setUser(user)
      setUserTxId(txId)
      showLoader(false)
    } catch (err) {
      if (err instanceof Error) {
        showSnackBar(err.message, false)
      } else {
        showSnackBar('Error occurred!', false)
      }
      showLoader(false)
    }
  }

  return (
    <>
      {userTxId ? (
        <div className="flex flex-col items-start border rounded-lg shadow-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-700">
          <div className="relative group w-full p-6 border-b border-gray-200 dark:border-gray-600">
            <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
              Account created.
            </p>
          </div>
        </div>
      ) : (
        <>
          <form
            onSubmit={onSubmit}
            className="w-full mx-auto bg-white shadow-md rounded-lg dark:bg-gray-700"
          >
            <div className="grid gap-6 p-6 border-b border-gray-200 dark:border-gray-600">
              <div>
                <label
                  htmlFor="userName"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            </div>
            <div className="p-6">
              <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Create Account
              </button>
            </div>
          </form>
        </>
      )}
    </>
  )
}

export function CreateUserModal({
  setUser,
}: {
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}) {
  const computer = useContext(ComputerContext)
  const [userTxId, setUserTxId] = useState('')
  const [userName, setUserName] = useState('')

  return (
    <Modal.Component
      title={'Please create your account!'}
      content={CreateUserModalContent}
      contentData={{
        computer,
        userTxId,
        setUserTxId,
        userName,
        setUserName,
        setUser,
      }}
      id={creaetUserModal}
    />
  )
}
