import React, { useState, useEffect } from 'react'
import { GrRefresh } from "react-icons/gr"
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
  const [refreshing, setRefreshing] = useState(false)

  const refresh = async () => {
    try {
      if (computer) setBalance((await computer.getBalance()).balance)
    } catch (err) {
      console.log(err)
      console.log("error occurred while fetching wallet details: ", err)
    }
  }

  const handleRefreshClick = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  useEffect(() => {
    (async () => {
      await refresh()
    })()
  }, [computer, chain])

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
            <br /> 
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>
                  {refreshing ? 'Refreshing...' : computer ? `${balance / 1e8} ${chain}` : 'Loading...'}
                </span>
                <GrRefresh onClick={handleRefreshClick} className="refresh-button" />
              </div>
            </div>
            <br />
            <b>Address</b>
            <br /> {computer ? computer.getAddress().toString() : 'Loading...'}
            <br />
            <br />
            <b>Public Key</b>
            <br /> {computer ? computer.getPublicKey().toString() : 'Loanding...'}
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
