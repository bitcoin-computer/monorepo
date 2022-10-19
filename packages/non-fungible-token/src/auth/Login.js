import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Computer } from "@bitcoin-computer/lib";
import SnackBar from "../component/util/snackBar";

function Login(props) {
  const { config, setComputer } = props;
  const [show, setShow] = useState(false);
  const [succes, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  // Clear the local storage
  localStorage.removeItem("BIP_39_KEY");
  localStorage.removeItem("CHAIN");

  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [chain, setChain] = useState("LTC");

  const login = () => {
    if (!password) {
      setMessage("Please provide valid password");
      setSuccess(false);
      setShow(true);
      return;
    }
    localStorage.setItem("BIP_39_KEY", password);
    localStorage.setItem("CHAIN", chain);
    setComputer(
      new Computer({
        ...config,
        mnemonic: localStorage.getItem("BIP_39_KEY"),
      })
    );
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-blue-400 flex justify-center items-center">
      <div className="absolute w-60 h-60 rounded-xl bg-blue-300 -top-5 -left-16 z-0 transform rotate-45 hidden md:block"></div>
      <div className="absolute w-48 h-48 rounded-xl bg-blue-300 -bottom-6 -right-10 transform rotate-12 hidden md:block"></div>
      <div className="py-12 px-12 bg-white rounded-2xl shadow-xl z-20">
        <div>
          <h1 className="text-3xl font-bold text-center mb-4 cursor-pointer">
            Bitcoin Token
          </h1>
        </div>
        <div className="space-y-4">
          <p className="font-sans">
            Don&apos;t forget to write down your seed.
          </p>
          {/*link to generate BIP39 Seed*/}
          <small>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://iancoleman.io/bip39/"
              className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
            >
              Generate BIP39 Seed
            </a>
          </small>
          {/*the input field for password*/}
          <input
            type="string"
            placeholder="Password (BIP39 Seed)"
            className="block  py-3 px-4 rounded-lg w-full border outline-none hover:shadow-inner"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/*dropdown to select the crypto*/}
          <select
            value={chain}
            onChange={(e) => {
              setChain(e.target.value);
            }}
            id="chain"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="LTC">LTC</option>
          </select>
        </div>
        {/*login button*/}
        <div className="text-center mt-6">
          <button
            onClick={login}
            className="py-3 w-64 text-xl text-white bg-blue-400 rounded-2xl"
          >
            Log In
          </button>
        </div>
      </div>
      {show && (
        <SnackBar message={message} success={succes} setShow={setShow} />
      )}
    </div>
  );
}

export default Login;
