import { ComputerContext } from '@bitcoin-computer/components'
import { useContext, useEffect, useState } from 'react'
import { VITE_CHESS_CHALLENGE_MOD_SPEC } from '../constants/modSpecs'
import { ChallengeList } from './ChallengesList'
import { StartGameModal } from './StartGame'

export const ChallengeListWrapper = () => {
  const [challenges, setChallenges] = useState<string[]>([])
  const computer = useContext(ComputerContext)
  const [challengeId, setChallengeId] = useState('')

  useEffect(() => {
    // Initial fetch without relying on scroll
    const fetch = async () => {
      const challengeRevs = await computer.query({
        mod: VITE_CHESS_CHALLENGE_MOD_SPEC,
        publicKey: computer.getPublicKey(),
      })
      setChallenges(challengeRevs.reverse())
    }
    fetch()
  }, [])

  return (
    <>
      <ChallengeList
        challenges={challenges}
        setChallenges={setChallenges}
        setChallengeId={setChallengeId}
      />
      <StartGameModal challengeId={challengeId} />
    </>
  )
}
