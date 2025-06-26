import { ChessChallengeTxWrapper, User } from '@bitcoin-computer/chess-contracts'
import { ComputerContext } from '@bitcoin-computer/components'
import { useContext, useEffect, useState } from 'react'
import { VITE_CHESS_CHALLENGE_MOD_SPEC } from '../constants/modSpecs'
import { ChallengeList, ChallengeType } from './ChallengesList'
import { StartGameModal } from './StartGame'

export const ChallengeListWrapper = ({ user }: { user: User | null }) => {
  const [challenges, setChallenges] = useState<ChallengeType[]>([])
  const computer = useContext(ComputerContext)
  const [challengeId, setChallengeId] = useState('')

  const getChallenges = async () => {
    const challengeRevs = await computer.query({
      mod: VITE_CHESS_CHALLENGE_MOD_SPEC,
      publicKey: computer.getPublicKey(),
    })

    const availableChallenges: ChallengeType[] = []

    const challengeSyncPromises: Promise<ChessChallengeTxWrapper>[] = []

    challengeRevs.forEach((rev) => {
      challengeSyncPromises.push(computer.sync(rev) as Promise<ChessChallengeTxWrapper>)
    })

    const challengesList = await Promise.all(challengeSyncPromises)

    challengesList.forEach((challenge) => {
      availableChallenges.push({ challengeId: challenge._id, new: !challenge.accepted })
    })

    return availableChallenges
  }
  const refreshList = async () => {
    const availableChallenges: ChallengeType[] = await getChallenges()

    setChallenges(availableChallenges.reverse())
  }

  useEffect(() => {
    // Initial fetch without relying on scroll
    const fetch = async () => {
      const availableChallenges: ChallengeType[] = await getChallenges()

      setChallenges(availableChallenges.reverse())
    }
    fetch()
  }, [])

  return (
    <>
      <ChallengeList
        user={user}
        refreshList={refreshList}
        challenges={challenges}
        setChallengeId={setChallengeId}
      />
      <StartGameModal challengeId={challengeId} />
    </>
  )
}
