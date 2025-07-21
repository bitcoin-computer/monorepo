import { useContext, useEffect, useState } from 'react'
import { bigIntToStr, ComputerContext, Modal, UtilsContext } from '@bitcoin-computer/components'
import { Computer } from '@bitcoin-computer/lib'
import { User, UserHelper } from '@bitcoin-computer/chess-contracts'
import { HiRefresh } from 'react-icons/hi'
import { VITE_CHESS_USER_MOD_SPEC } from '../constants/modSpecs'

export const creaetUserModal = 'create-user-modal'

export function CreateUserModalContent({
  userTxId,
  setUserTxId,
  computer,
  setUserName,
  userName,
  setUser,
  setTitle,
  currentBalance,
}: {
  userTxId: string
  setUserTxId: React.Dispatch<React.SetStateAction<string>>
  computer: Computer
  userName: string
  setUserName: React.Dispatch<React.SetStateAction<string>>
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  setTitle: React.Dispatch<React.SetStateAction<string>>
  currentBalance: bigint
}) {
  const { showLoader, showSnackBar } = UtilsContext.useUtilsComponents()
  const [balance, setBalance] = useState<bigint>(currentBalance)
  const [address, setAddress] = useState<string>('')

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      const userHelper = new UserHelper({ computer, mod: VITE_CHESS_USER_MOD_SPEC })
      const txId = await userHelper.createUser(userName)
      const [rev] = await computer.query({ ids: [txId + ':0'] })
      const user = (await computer.sync(rev)) as User
      setUser(user)
      setUserTxId(txId)
      setTitle('Account created successfully!')
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

  const fund = async () => {
    await computer.faucet(1e8)
    setBalance((await computer.getBalance()).balance)
  }

  const refreshBalance = async () => {
    setBalance((await computer.getBalance()).balance)
    setAddress(await computer.getAddress())
  }

  useEffect(() => {
    refreshBalance()
  }, [])

  return (
    <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md max-w-md mx-auto">
      {userTxId ? (
        <div className="flex flex-col items-start">
          <span className="text-gray-800 dark:text-gray-200">
            Click on "New Game" to start playing.
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Balance Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Balance: {bigIntToStr(balance)} {computer.getChain()}
                </span>
                <HiRefresh
                  onClick={refreshBalance}
                  className="w-4 h-4 cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                />
              </div>
              {computer.getNetwork() === 'regtest' && (
                <button
                  id="fund-wallet"
                  type="button"
                  onClick={fund}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  Fund Wallet
                </button>
              )}
            </div>
            {computer.getNetwork() !== 'regtest' && (
              <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Fund your address
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-300 break-all">{address}</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="userName"
                className="block mb-2 text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                placeholder="Enter your name"
              />
            </div>
            <button
              type="submit"
              disabled={balance === 0n}
              className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors ${
                balance === 0n
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              Create Account
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export function CreateUserModal({
  setUser,
  currentBalance,
}: {
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  currentBalance: bigint
}) {
  const computer = useContext(ComputerContext)
  const [userTxId, setUserTxId] = useState('')
  const [userName, setUserName] = useState('')
  const [title, setTitle] = useState<string>('Please create your account!')

  return (
    <Modal.Component
      title={title}
      content={CreateUserModalContent}
      contentData={{
        computer,
        userTxId,
        setUserTxId,
        userName,
        setUserName,
        setUser,
        setTitle,
        currentBalance,
      }}
      id={creaetUserModal}
    />
  )
}
