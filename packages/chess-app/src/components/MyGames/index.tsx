import {
  ChessContract,
  User,
  Chess as ChessLib,
  ChessContractHelper,
  signRedeemTx,
} from '@bitcoin-computer/chess-contracts'
import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ComputerContext, UtilsContext } from '@bitcoin-computer/components'
import { useNavigate } from 'react-router-dom'
import { getGameState } from '../utils'
import { VITE_CHESS_GAME_MOD_SPEC, VITE_CHESS_USER_MOD_SPEC } from '../../constants/modSpecs'
import { Computer } from '@bitcoin-computer/lib'

const renderButtonContent = (
  game: ChessLib | undefined,
  paymentReleased: boolean,
  chessContract: ChessContract | null,
  computer: Computer,
  requestRelease: () => Promise<void>,
  releaseFund: () => Promise<void>,
) => {
  if (!game || !game.isGameOver()) {
    return null
  }

  if (paymentReleased) {
    return <span>Funds Released</span>
  }

  const isOwner = chessContract?._owners[0] === computer.getPublicKey()
  const buttonStyles = `
    mt-1 text-white bg-blue-700 hover:bg-blue-800 
    focus:ring-4 focus:outline-none focus:ring-blue-300 
    font-medium rounded-lg text-sm w-full sm:w-auto 
    px-5 py-2.5 text-center dark:bg-blue-600 
    dark:hover:bg-blue-700 dark:focus:ring-blue-800 
    disabled:bg-gray-400 disabled:text-gray-100 
    disabled:cursor-not-allowed disabled:hover:bg-gray-400
  `

  if (isOwner) {
    return (
      <button
        onClick={() => requestRelease()}
        disabled={!chessContract || !!chessContract.winnerTxWrapper.redeemTxHex}
        className={buttonStyles}
      >
        Request Release
      </button>
    )
  }

  return (
    <button
      onClick={releaseFund}
      disabled={!chessContract || !chessContract.winnerTxWrapper.redeemTxHex}
      className={buttonStyles}
    >
      Release Fund
    </button>
  )
}

const UserRow = ({ gameId }: { gameId: string }) => {
  const computer = useContext(ComputerContext)
  const [chessContract, setChessContract] = useState<ChessContract | null>(null)
  const [game, setGame] = useState<ChessLib>()
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()
  const [paymentReleased, setPaymentReleased] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [latestRev] = await computer.query({ ids: [gameId] })
      const syncedObj = (await computer.sync(latestRev)) as ChessContract
      setChessContract(syncedObj)
      setGame(new ChessLib(syncedObj.fen))
      if (!syncedObj?.payment) {
        showSnackBar('Invalid payment object', false)
        return
      }
      const isUnspent = await computer.isUnspent(syncedObj?.payment._rev)
      setPaymentReleased(!isUnspent)
    }
    fetch()
  }, [])

  const requestRelease = async () => {
    try {
      showLoader(true)
      if (!computer || !chessContract) {
        showSnackBar('Not a valid chess contract', false)
        return
      }
      const { nameB, nameW, amount, publicKeyB, publicKeyW } = chessContract
      const chessContractHelper = new ChessContractHelper({
        computer,
        nameB,
        nameW,
        amount,
        publicKeyB,
        publicKeyW,
        mod: VITE_CHESS_GAME_MOD_SPEC,
        userMod: VITE_CHESS_USER_MOD_SPEC,
      })
      await chessContractHelper.spend(chessContract)
    } catch (error) {
      showSnackBar(
        error instanceof Error ? error.message : 'Error occurred while creating transaction',
        false,
      )
    } finally {
      showLoader(false)
    }
  }
  const releaseFund = async () => {
    try {
      showLoader(true)
      if (!computer || !chessContract) {
        showSnackBar('Not a valid chess contract', false)
        return
      }
      const signedRedeemTx = await signRedeemTx(
        computer,
        chessContract,
        chessContract?.winnerTxWrapper,
      )
      const finalTxId = await computer.broadcast(signedRedeemTx)
      setPaymentReleased(true)
      showSnackBar(`You lost the game, fund released. Transaction: ${finalTxId}`, true)
    } catch (error) {
      showSnackBar(
        error instanceof Error ? error.message : 'Error occurred while releasing fund',
        false,
      )
    } finally {
      showLoader(false)
    }
  }

  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td className="px-6 py-4 break-all">
        <Link
          to={`/game/${gameId}`}
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          {`${gameId.slice(0, 40)}...`}
        </Link>
      </td>
      <td>
        {chessContract ? `${chessContract.amount / 1e8} ${computer.getChain()}` : 'Loading...'}
      </td>
      <td>{game ? getGameState(game) : 'Loading...'}</td>
      <td>
        {game?.isGameOver()
          ? chessContract?._owners?.[0] === computer.getPublicKey()
            ? 'You won'
            : 'You lost'
          : ''}
      </td>
      <td>
        {
          renderButtonContent(
            game,
            paymentReleased,
            chessContract,
            computer,
            requestRelease,
            releaseFund,
          )
          // !game ? (
          //   <></>
          // ) : game?.isGameOver() ? (
          //   paymentReleased ? (
          //     <>Funds Released</>
          //   ) : chessContract?._owners[0] === computer.getPublicKey() ? (
          //     <button
          //       onClick={() => requestRelease()}
          //       disabled={!chessContract || !!chessContract.winnerTxWrapper.redeemTxHex}
          //       className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
          //     >
          //       Request Release
          //     </button>
          //   ) : (
          //     <button
          //       onClick={() => releaseFund()}
          //       disabled={!chessContract || !chessContract.winnerTxWrapper.redeemTxHex}
          //       className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
          //     >
          //       Release Fund
          //     </button>
          //   )
          // ) : (
          //   <></>
          // )
        }
      </td>
    </tr>
  )
}
const UserGamesList = () => {
  const [user, setUser] = useState<User | undefined>()

  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()
  const computer = useContext(ComputerContext)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      showLoader(true)
      try {
        const [userRev] = await computer.query({
          mod: VITE_CHESS_USER_MOD_SPEC,
          publicKey: computer.getPublicKey(),
        })
        if (!userRev) {
          showSnackBar('No account exist, please create one', false)
          navigate('/')
          return
        }
        const userObj = (await computer.sync(userRev)) as User
        setUser(userObj)
      } catch {
        showSnackBar('Error occurred', false)
      } finally {
        showLoader(false)
      }
    }

    fetchUser()
  }, [computer])

  return (
    <div className="relative overflow-x-auto">
      <h2 className="mb-2 text-2xl font-bold dark:text-white">My Games</h2>
      <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3">Game ID</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">State</th>
            <th className="px-6 py-3">Result</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>{user?.games?.map((gameId) => <UserRow key={gameId} gameId={gameId} />)}</tbody>
      </table>
    </div>
  )
}

const MyGames = () => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dark:bg-gray-900">
        <div className="md:col-span-3">
          <UserGamesList />
        </div>
      </div>
    </div>
  )
}

export { MyGames }
