import React, { useEffect, useState } from "react";
import { GrClose, GrRefresh } from "react-icons/gr";
import SnackBar from "../util/snackBar";
import { FaCopy } from "react-icons/fa";

export default function Wallet({ computer, isOpen, setIsOpen }) {
  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    (async () => {
      await refreshBalance();
    })();

    // eslint-disable-next-line
  }, [computer]);

  const refreshBalance = async () => {
    try {
      if (computer) {
        const newBalance = await computer.getBalance();
        console.log("new balance: ", newBalance);
        console.log("public key: ", computer.getPublicKey());
        setBalance(newBalance);
      }
    } catch (err) {
      setSuccess(false);
      setMessage(err.message);
      setShow(true);
      console.log("error occurred while fetching wallet details: ", err);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(computer.getAddress().toString());
    setSuccess(true);
    setMessage("Copied");
    setShow(true);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(computer.getPublicKey().toString());
    setSuccess(true);
    setMessage("Copied");
    setShow(true);
  };
  return (
    <main
      className={
        " mt-20 fixed overflow-hidden z-10 bg-gray-900 bg-opacity-25 inset-0 transform ease-in-out " +
        (isOpen
          ? " transition-opacity opacity-100 duration-500 translate-x-0  "
          : " transition-all delay-500 opacity-0 translate-x-full  ")
      }
    >
      <section
        className={
          " w-screen max-w-md right-0 absolute bg-white h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform  " +
          (isOpen ? " translate-x-0 " : " translate-x-full ")
        }
      >
        <article className="relative w-screen max-w-md pb-10 flex flex-col space-y-6 overflow-y-scroll h-full">
          <div flex flex-row mb-2>
            <h2 className="mt-4 float-left font-bold text-xl ml-4">Wallet</h2>
            <GrClose
              onClick={() => {
                setIsOpen(false);
              }}
              className="float-right text-2xl mt-4 mr-4 hover:text-slate-500 cursor-pointer"
            ></GrClose>
          </div>
          <div class="p-4 w-full mt-4">
            <h5 class="mb-4 text-md text-center font-medium text-gray-700">
              Total Balance
            </h5>
            <div class="flex flex-row place-items-center justify-center dark:text-black">
              <span class=" text-center text-2xl font-extrabold">
                {balance / 1e8}
              </span>
              <span class="text-2xl ml-2 font-extrabold">LTC</span>
              <GrRefresh
                onClick={refreshBalance}
                className=" text-2xl ml-4 hover:text-slate-500 cursor-pointer"
              ></GrRefresh>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex flex-row ml-4">
              <h2>
                <span className="font-bold">Address</span>:
              </h2>
              <div className="ml-2">
                {computer.getAddress().toString().substring(0, 16) +
                  "..." +
                  computer.getAddress().toString().slice(-8)}
              </div>
              <FaCopy
                onClick={copyAddress}
                className="text-2xl pl-2 hover:text-slate-500 cursor-pointer"
              ></FaCopy>
            </div>
          </div>
          <div className="mt-1">
            <div className="flex flex-row ml-4">
              <h2>
                <span className="font-bold">Public Key</span>:
              </h2>
              <div className="ml-2">
                {computer.getPublicKey().toString().substring(0, 20) +
                  "..." +
                  computer.getPublicKey().toString().slice(-8)}
              </div>
              <FaCopy
                onClick={copyKey}
                className="text-2xl pl-2 hover:text-slate-500 cursor-pointer"
              ></FaCopy>
            </div>
          </div>
        </article>
      </section>
      <section
        className=" w-screen h-full cursor-pointer "
        onClick={() => {
          setIsOpen(false);
        }}
      ></section>
      {show && (
        <SnackBar success={success} message={message} setShow={setShow} />
      )}
    </main>
  );
}
