import React, { useState } from 'react'
import useInterval from './useInterval'
import { Modal, ModalContent, Close } from './Modal'
import type { Computer } from 'bitcoin-computer'
import PropTypes from 'prop-types'

export interface IWalletProps {
  computer: typeof Computer
  chain: string
}

const Wallet: React.FC<IWalletProps> = ({ computer, chain }) => {
  const [balance, setBalance] = useState(0)
  const [isVisible, setVisible] = useState(false)
  useInterval(() => {
    const getBalance = async () => {
      if (computer) setBalance(await computer?.db?.wallet.getBalance())
    }
    getBalance()
  }, 3000)
  return (
    <>
      <button onClick={() => setVisible(true)}>Wallet</button>
      {isVisible && (
        <Modal>
          <ModalContent>
            <Close onClick={() => setVisible(false)}>&times;</Close>
            <h1>Wallet</h1>
            {balance === 0 && (
              <p>
                Copy your address into {' '}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://testnet-faucet.com/ltc-testnet/"
                >
                  this
                </a>{' '} or {' '}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="http://litecointf.salmen.website/"
                >
                  this LTC faucet
                </a>{' '}
                to fund your wallet.
              </p>
            )}
            <b>Balance</b>
            <br /> {balance / 1e8} {chain}
            <br />
            <br />
            <b>Address</b>
            <br /> {computer ? computer.getAddress().toString() : ''}
            <br />
            <br />
            <b>Public Key</b>
            <br /> {computer ? computer.getPublicKey().toString() : ''}
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

Wallet.propTypes = {
  computer: PropTypes.object,
  chain: PropTypes.string.isRequired,
}

export default Wallet
