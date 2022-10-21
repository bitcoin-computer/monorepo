import { NavLink, useNavigate } from "react-router-dom";
import { FaWallet } from "react-icons/fa";
import { useState } from "react";
import Wallet from "../wallet/wallet";

export default function Navbar({ computer }) {
  const navigate = useNavigate();
  const loggedIn = localStorage.getItem("BIP_39_KEY") !== null;
  const logout = () => {
    localStorage.removeItem("BIP_39_KEY");
    localStorage.removeItem("CHAIN");
    navigate("/auth/login");
  };

  const [isOpen, setIsOpen] = useState(false && loggedIn);
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
            <div className="flex md:order-2">
              <button
                onClick={logout}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Log Out
              </button>
            </div>
          )}
          {loggedIn && (
            <div
              className="hidden justify-between ml-auto mr-5 items-center w-full md:flex md:w-auto md:order-1"
              id="navbar-sticky"
            >
              <ul className="flex flex-col p-4 mt-4 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 bg-white dark:border-gray-700">
                <li>
                  <NavLink
                    to="/"
                    className="block py-2 pr-4 text-gray-700 text-lg rounded hover:text-gray-900 cursor-pointer"
                  >
                    Artworks
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
                    className="block py-2 pr-4 text-gray-700 rounded hover:text-gray-900 cursor-pointer"
                  >
                    <FaWallet className="text-2xl"></FaWallet>
                    {/* Wallet */}
                  </span>
                </li>
              </ul>
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
