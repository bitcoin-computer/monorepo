import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  // Clear the local storage
  localStorage.removeItem("BIP_39_KEY");
  localStorage.removeItem("CHAIN");

  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [chain, setChain] = useState("");

  const login = () => {
    localStorage.setItem("BIP_39_KEY", password);
    localStorage.setItem("CHAIN", chain);
    navigate("/");
  };

  return (
    <div className="Login">
      <div id="">
        <div className="module center padding-left-24">
          <h2 className="margin-auto">Bitcoin Token</h2>
          <p>Don&apos;t forget to write down your seed.</p>
          <small>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://iancoleman.io/bip39/"
            >
              Generate BIP39 Seed
            </a>
          </small>
          <br />
          <form onSubmit={login}>
            <input
              className="textbox"
              placeholder="Password (BIP39 Seed)"
              type="string"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select
              value={chain}
              onChange={(e) => {
                setChain(e.target.value);
              }}
              id="chain"
            >
              <option value="LTC">LTC</option>
            </select>
            <button type="submit" className="button">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
