import { Dispatch, SetStateAction, useState } from "react"
import Wallet from "./Wallet"
import Navbar from "./Navbar"
import Login from "./Login"
import { Computer } from "@bitcoin-computer/lib"
import { Config } from "../types/common"

export default function NavbarWrapper(props: {
  computer: Computer
  config: Config
  setComputer: Dispatch<SetStateAction<Computer>>
}) {
  const { computer, config, setComputer } = props
  const [loggedIn] = useState(localStorage.getItem("BIP_39_KEY") !== null)
  const [isOpen, setIsOpen] = useState(false && loggedIn)
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div>
      <Navbar setIsOpen={setIsOpen} computer={computer} setShowLogin={setShowLogin} />
      <Wallet computer={computer} isOpen={isOpen} setIsOpen={setIsOpen} />
      {showLogin && (
        <Login
          showLogin={showLogin}
          config={config}
          setComputer={setComputer}
          setShowLogin={setShowLogin}
        />
      )}
    </div>
  )
}
