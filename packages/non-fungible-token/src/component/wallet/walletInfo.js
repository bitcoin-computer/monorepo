import React, { useState, useEffect } from "react";
import { FaCopy } from "react-icons/fa";
import SnackBar from "../util/snackBar";

function WalletInfo(props) {
  const { computer } = props;
  const [balance, setBalance] = useState(0);

  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

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

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess(true);
    setMessage("Copied");
    setShow(true);
  };

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
            onClick={copyText(computer.getPublicKey())}
            className="text-2xl mt-1 pl-2 hover:text-slate-500 cursor-pointer"
          ></FaCopy>
        </div>
        <div className="flex flex-row  mb-2 ">
          <p className="mr-2 font-bold">Public Key</p>
          <div className="border shadow-inner rounded-lg ">
            <div className="m-1">{computer.getPublicKey().toString()}</div>
          </div>
          <FaCopy
            onClick={copyText(computer.getPublicKey())}
            className="text-2xl mt-1 pl-2 hover:text-slate-500 cursor-pointer"
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
      {show && (
        <SnackBar success={success} message={message} setShow={setShow} />
      )}
    </div>
  );
}

export default WalletInfo;
