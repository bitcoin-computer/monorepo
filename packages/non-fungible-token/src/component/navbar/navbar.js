import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar({
  loggedIn,
  setIsOpen,
  setPublicKey,
  computer,
}) {
  const [publicKeyInput, setPublicKeyInput] = useState("");
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("BIP_39_KEY");
    localStorage.removeItem("CHAIN");
    setPublicKeyInput("");
    setPublicKey("");
    navigate("/auth/login");
  };

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
            <div className="relative">
              <input
                type="search"
                id="default-search"
                className="block p-4 w-full w-100 md:w-80 sm:w-48 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
                placeholder="Search Public Key"
                value={publicKeyInput}
                onChange={(e) => setPublicKeyInput(e.target.value)}
              />
              <button
                onClick={search}
                type="submit"
                className="text-white absolute right-2.5 bottom-2.5 bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2"
              >
                Search
              </button>
            </div>
          )}
          {loggedIn && (
            <div className="flex">
              <ul className="flex p-4 mt-4 rounded-lg mt-0 flex-row space-x-4 text-sm font-medium bg-white">
                <li>
                  <NavLink
                    to="/"
                    onClick={() => setPublicKey(computer.getPublicKey())}
                    className="block py-2 pr-4 text-gray-700 text-lg rounded hover:text-gray-900 cursor-pointer"
                  >
                    My Art
                  </NavLink>
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
                    className="block py-2 pr-4 text-gray-700 text-lg rounded hover:text-gray-900 cursor-pointer"
                  >
                    Wallet
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
    </div>
  );
}
