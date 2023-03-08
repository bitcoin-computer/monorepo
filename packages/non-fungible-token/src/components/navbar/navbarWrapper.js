import { useState } from "react"
import Wallet from "../wallet"
import NavbarNew from "./navbarNew"
import LoginNew from "../../auth/login-new"

export default function NavbarWrapper({ computer, config, setComputer }) {
  const [loggedIn] = useState(localStorage.getItem("BIP_39_KEY") !== null)
  const [isOpen, setIsOpen] = useState(false && loggedIn)
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div>
      <NavbarNew setIsOpen={setIsOpen} computer={computer} setShowLogin={setShowLogin} />
      <Wallet computer={computer} isOpen={isOpen} setIsOpen={setIsOpen} />
      {showLogin && (
        <LoginNew
          showLogin={showLogin}
          config={config}
          setComputer={setComputer}
          setShowLogin={setShowLogin}
        />
      )}
    </div>
  )
}
