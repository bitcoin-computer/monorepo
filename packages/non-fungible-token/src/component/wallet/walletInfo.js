import React, { useState, useEffect } from "react";
import { FaCopy } from "react-icons/fa";

function WalletInfo(props) {
  const { computer } = props;
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        if (computer) {
          const newBalance = await computer.getBalance();
          console.log("new balance: ", newBalance);
          console.log("public key: ", computer.getPublicKey());
          setBalance(newBalance);
        }
      } catch (err) {
        console.log("error occurred while fetching wallet details: ", err);
      }
    })();

    
    // eslint-disable-next-line
  }, [computer]);

  return (
    <div className="mt-40 sm:mx-auto sm:w-full sm:max-w-3xl border shadow-md rounded-lg">
      <div className="m-4">
        <h2 className="text-center font-medium text-xl mb-4">Wallet</h2>
        <div className="flex flex-row mb-2 ">
          <p className="mr-2 font-bold">Address</p>
          <div className="border shadow-inner rounded-lg ">
            <div className="m-1">{computer.getAddress().toString()}</div>
          </div>
          <FaCopy
            onClick={() => {
              navigator.clipboard.writeText(computer.getAddress().toString());
            }}
            className="text-2xl mt-1 pl-2"
          ></FaCopy>
        </div>
        <div className="flex flex-row  mb-2 ">
          <p className="mr-2 font-bold">Public Key</p>
          <div className="border shadow-inner rounded-lg ">
            <div className="m-1">{computer.getPublicKey().toString()}</div>
          </div>
          <FaCopy
            onClick={() => {
              navigator.clipboard.writeText(computer.getPublicKey().toString());
            }}
            className="text-2xl mt-1 pl-2"
          ></FaCopy>
        </div>
        <div className="flex flex-row   ">
          <p className="mr-2 font-bold">Balance</p>
          <div className="border shadow-inner rounded-lg ">
            <div className="m-1">
              {balance / 1e8}
              {" LTC"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletInfo;
