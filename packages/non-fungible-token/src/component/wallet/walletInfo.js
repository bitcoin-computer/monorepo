import React, { useState, useEffect } from "react";

function WalletInfo(props) {
  const { computer } = props;
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (computer) {
          const newBalance = await computer.getBalance();
          // console.log("new balance: ", newBalance);
          // console.log("public key: ", computer.getPublicKey());
          setBalance(newBalance);
        }
      } catch (err) {
        console.log("error occurred while fetching wallet details: ", err);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [computer]);

  return (
    <div className="Artworks">
      <h2>Wallet</h2>
      <b>Address</b>&nbsp;{computer.getAddress()}
      <br />
      <b>Public Key</b>&nbsp;{computer.getPublicKey()}
      <br />
      <b>Balance</b>&nbsp;{balance / 1e8}
      {" LTC"}
      <br />
    </div>
  );
}

export default WalletInfo;
