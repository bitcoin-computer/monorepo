import { NavLink, useNavigate } from "react-router-dom";
import { FaWallet } from "react-icons/fa";
import { useState } from "react";
import Wallet from "../wallet/wallet";

export default function Navbar({ setPublicKey, computer }) {
  const [publicKeyInput, setPublicKeyInput] = useState("");
  const navigate = useNavigate();
  const loggedIn = localStorage.getItem("BIP_39_KEY") !== null;
  const logout = () => {
    localStorage.removeItem("BIP_39_KEY");
    localStorage.removeItem("CHAIN");
    setPublicKeyInput("");
    setPublicKey("");
    navigate("/auth/login");
  };

  const [isOpen, setIsOpen] = useState(false && loggedIn);

  const search = () => {
    setPublicKey(publicKeyInput);
  };
  return (
    <div>
      <nav className="bg-white fixed w-full z-20 top-0 left-0 border-b border-gray-200">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <div className="flex items-center">
            <a href="/">
              <img
                src="/logo.png"
                className=" mt-2 mr-1 h-16"
                alt="Bitcoin Computer"
              />
            </a>
          </div>
          {loggedIn && (
            <div class="relative">
              <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <svg
                  aria-hidden="true"
                  class="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                class="block p-4 pl-10 w-full w-100 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
                placeholder="Search Public Key"
                value={publicKeyInput}
                onChange={(e) => setPublicKeyInput(e.target.value)}
              />
              <button
                onClick={search}
                type="submit"
                class="text-white absolute right-2.5 bottom-2.5 bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2"
              >
                Search
              </button>
            </div>
          )}
          {loggedIn && (
            <div className="flex">
              <ul className="flex p-4 mt-4 rounded-lg mt-0 flex-row space-x-4 text-sm font-medium bg-white">
                <li>
                  <span
                    onClick={() => setPublicKey(computer.getPublicKey())}
                    className="block py-2 pr-4 text-gray-700 text-lg rounded hover:text-gray-900 cursor-pointer"
                  >
                    My Art
                  </span>
                </li>
                <li>
                  <NavLink
                    to="/art/artworkform"
                    className="block py-2 pr-4 text-gray-700 text-lg rounded hover:text-gray-900 cursor-pointer"
                  >
                    Create
                  </NavLink>
                </li>
                <li>
                  <span
                    onClick={() => {
                      setIsOpen(true);
                    }}
                    className="block py-2 pr-4 text-gray-700 rounded hover:text-gray-900 cursor-pointer"
                  >
                    <FaWallet className="text-2xl"></FaWallet>
                  </span>
                </li>
              </ul>
              <button
                onClick={logout}
                type="button"
                className="text-white mt-4 w-auto p-2 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-md"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </nav>
      {loggedIn && (
        <Wallet computer={computer} isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
    </div>
  );
}
