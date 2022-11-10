import { useState } from "react";
import Navbar from "./navbar";
import Wallet from "../wallet/wallet";

export default function NavbarWrapper({ setPublicKey, computer }) {
  const [loggedIn] = useState(localStorage.getItem("BIP_39_KEY") !== null);
  const [isOpen, setIsOpen] = useState(false && loggedIn);

  return (
    <div>
      <Navbar
        loggedIn={loggedIn}
        setIsOpen={setIsOpen}
        setPublicKey={setPublicKey}
        computer={computer}
      />
      {loggedIn && (
        <Wallet computer={computer} isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
    </div>
  );
}
