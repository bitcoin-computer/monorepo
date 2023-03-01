import { useState } from "react"
import Navbar from "./navbar"
import Wallet from "../wallet"

export default function NavbarWrapper({ computer }) {
  const [loggedIn] = useState(localStorage.getItem("BIP_39_KEY") !== null)
  const [isOpen, setIsOpen] = useState(false && loggedIn)

  return (
    <div>
        <Navbar setIsOpen={setIsOpen} computer={computer} />
        <Wallet computer={computer} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}
