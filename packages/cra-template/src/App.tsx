import "./App.css"
import { useEffect } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import NavBar from "./components/Navbar"
import { initFlowbite } from "flowbite"
import { Auth, Error404, UtilsContext, Wallet } from "@bitcoin-computer/components"
import Counter from "./components/Counter"
export default function App() {
  useEffect(() => {
    initFlowbite()
  }, [])

  return (
    <BrowserRouter>
      <span className="bg-gray-900/50 dark:bg-gray-900/80 z-30 inset-0 sr-only"></span>
      <UtilsContext.UtilsProvider>
        <Auth.LoginModal />
        <Wallet />
        <NavBar />
        <div className="p-8 max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
          <Routes>
            <Route path="/" element={<Counter />} />
            <Route path="*" element={<Navigate to="/" replace={true} />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </div>
      </UtilsContext.UtilsProvider>
    </BrowserRouter>
  )
}
