import React, { useState, useEffect } from "react";

function WalletInfo(props) {
  const { computer } = props;
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
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
    }, 5000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [computer]);

  return (
    <div className=" mt-10 sm:mx-auto sm:w-full sm:max-w-md border shadow-md rounded-lg">
      <div className="m-4">
        <h2 className="text-center font-medium text-xl mb-4">Wallet</h2>
        <div className="flex flex-row mb-2 ">
          <p className="mr-2 font-bold">Address</p>
          <div className="border shadow-inner rounded-lg ">
            <div className="m-1">
              {computer.getAddress().toString().substring(0, 15) + "..."}
            </div>
          </div>
        </div>
        <div className="flex flex-row  mb-2 ">
          <p className="mr-2 font-bold">Public Key</p>
          <div className="border shadow-inner rounded-lg ">
            <div className="m-1">
              {computer.getPublicKey().toString().substring(0, 15) + "..."}
            </div>
          </div>
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
