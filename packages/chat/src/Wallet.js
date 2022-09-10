import React, { useState } from "react";
import Login from "./Login";
import useInterval from "./useInterval";

function Wallet({ computer, chain }) {
  const [balance, setBalance] = useState(0);

  useInterval(() => {
    const getBalance = async () => {
      if (computer) setBalance(await computer.getBalance());
    };
    getBalance();
  }, 3000);

  return (
    <div className="flex">
      <small>
        <b>Public Key</b> {computer ? computer.getPublicKey() : ""}
        <br />
      </small>
      <small>
        <b>Balance</b> {balance / 1e8} {chain}
      </small>
      <small>
        <b>Address</b> {computer ? computer.getAddress() : ""}
        <br />
      </small>
      <small>
        <Login></Login>
      </small>
    </div>
  );
}

export default Wallet;
