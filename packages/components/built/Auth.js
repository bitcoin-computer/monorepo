var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime"
import { useEffect, useRef, useState } from "react"
import { Computer } from "@bitcoin-computer/lib"
import { initFlowbite } from "flowbite"
import { HiRefresh } from "react-icons/hi"
import { useUtilsComponents } from "./UtilsContext"
import { Modal } from "./Modal"
function isLoggedIn() {
  return !!localStorage.getItem("BIP_39_KEY")
}
function logout() {
  localStorage.removeItem("BIP_39_KEY")
  localStorage.removeItem("CHAIN")
  localStorage.removeItem("NETWORK")
  localStorage.removeItem("PATH")
  localStorage.removeItem("URL")
  window.location.href = "/"
}
function getCoinType(chain, network) {
  if (["testnet", "regtest"].includes(network)) return 1
  if (chain === "BTC") return 0
  if (chain === "LTC") return 2
  if (chain === "DOGE") return 3
  if (chain === "PEPE") return 3434
  if (chain === "BCH") return 145
  throw new Error("Unsupported chain ".concat(chain, " or network ").concat(network))
}
function getBip44Path(_a) {
  var _b = _a === void 0 ? {} : _a,
    _c = _b.purpose,
    purpose = _c === void 0 ? 44 : _c,
    _d = _b.coinType,
    coinType = _d === void 0 ? 2 : _d,
    _e = _b.account,
    account = _e === void 0 ? 0 : _e
  return "m/"
    .concat(purpose.toString(), "'/")
    .concat(coinType.toString(), "'/")
    .concat(account.toString(), "'")
}
function loggedOutConfiguration() {
  return {
    chain:
      (typeof process !== "undefined" && process.env.REACT_APP_CHAIN) || import.meta.env.VITE_CHAIN,
    network:
      (typeof process !== "undefined" && process.env.REACT_APP_NETWORK) ||
      import.meta.env.VITE_NETWORK,
    url: (typeof process !== "undefined" && process.env.REACT_APP_URL) || import.meta.env.VITE_URL
  }
}
function loggedInConfiguration() {
  return {
    mnemonic: localStorage.getItem("BIP_39_KEY"),
    chain:
      localStorage.getItem("CHAIN") ||
      (typeof process !== "undefined" && process.env.REACT_APP_CHAIN) ||
      import.meta.env.VITE_CHAIN,
    network:
      localStorage.getItem("NETWORK") ||
      (typeof process !== "undefined" && process.env.REACT_APP_NETWORK) ||
      import.meta.env.VITE_NETWORK,
    url:
      localStorage.getItem("URL") ||
      (typeof process !== "undefined" && process.env.REACT_APP_URL) ||
      import.meta.env.VITE_URL
  }
}
function getComputer() {
  return new Computer(isLoggedIn() ? loggedInConfiguration() : loggedOutConfiguration())
}
function MnemonicInput(_a) {
  var mnemonic = _a.mnemonic,
    setMnemonic = _a.setMnemonic
  return _jsxs(_Fragment, {
    children: [
      _jsxs(
        "div",
        __assign(
          { className: "flex justify-between" },
          {
            children: [
              _jsx(
                "label",
                __assign(
                  { className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" },
                  { children: "BIP 39 Mnemonic" }
                )
              ),
              _jsx(HiRefresh, {
                onClick: function () {
                  return setMnemonic(new Computer().getMnemonic())
                },
                className:
                  "w-4 h-4 ml-2 text-sm font-medium text-gray-900 dark:text-white inline cursor-pointer hover:text-slate-700 dark:hover:text-slate-100"
              })
            ]
          }
        )
      ),
      _jsx("input", {
        value: mnemonic,
        onChange: function (e) {
          return setMnemonic(e.target.value)
        },
        className:
          "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white",
        required: true
      })
    ]
  })
}
function ChainInput(_a) {
  var chain = _a.chain,
    setChain = _a.setChain
  return _jsxs(_Fragment, {
    children: [
      _jsx(
        "label",
        __assign(
          { className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white" },
          { children: "Chain" }
        )
      ),
      _jsxs(
        "fieldset",
        __assign(
          { className: "flex" },
          {
            children: [
              _jsx("legend", __assign({ className: "sr-only" }, { children: "Chain" })),
              _jsxs(
                "div",
                __assign(
                  { className: "flex items-center mr-4" },
                  {
                    children: [
                      _jsx("input", {
                        onChange: function () {
                          return setChain("LTC")
                        },
                        checked: chain === "LTC",
                        id: "chain-ltc",
                        type: "radio",
                        name: "chain",
                        value: "LTC",
                        className:
                          "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
                      }),
                      _jsx(
                        "label",
                        __assign(
                          {
                            htmlFor: "chain-ltc",
                            className:
                              "block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300"
                          },
                          { children: "LTC" }
                        )
                      )
                    ]
                  }
                )
              ),
              _jsxs(
                "div",
                __assign(
                  { className: "flex items-center mr-4" },
                  {
                    children: [
                      _jsx("input", {
                        onChange: function () {
                          return setChain("BTC")
                        },
                        checked: chain === "BTC",
                        id: "chain-btc",
                        type: "radio",
                        name: "chain",
                        value: "BTC",
                        className:
                          "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
                      }),
                      _jsx(
                        "label",
                        __assign(
                          {
                            htmlFor: "chain-btc",
                            className:
                              "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                          },
                          { children: "BTC" }
                        )
                      )
                    ]
                  }
                )
              ),
              _jsxs(
                "div",
                __assign(
                  { className: "flex items-center mr-4" },
                  {
                    children: [
                      _jsx("input", {
                        onChange: function () {
                          return setChain("PEPE")
                        },
                        id: "chain-pepe",
                        type: "radio",
                        name: "chain",
                        value: "PEPE",
                        className:
                          "w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                      }),
                      _jsx(
                        "label",
                        __assign(
                          {
                            htmlFor: "chain-pepe",
                            className:
                              "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                          },
                          { children: "PEPE" }
                        )
                      )
                    ]
                  }
                )
              ),
              _jsxs(
                "div",
                __assign(
                  { className: "flex items-center mr-4" },
                  {
                    children: [
                      _jsx("input", {
                        onChange: function () {
                          return setChain("DOGE")
                        },
                        id: "chain-doge",
                        type: "radio",
                        name: "chain",
                        value: "DOGE",
                        className:
                          "w-4 h-4 border-gray-200 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600",
                        disabled: true
                      }),
                      _jsx(
                        "label",
                        __assign(
                          {
                            htmlFor: "chain-doge",
                            className:
                              "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                          },
                          { children: "DOGE" }
                        )
                      )
                    ]
                  }
                )
              )
            ]
          }
        )
      )
    ]
  })
}
function NetworkInput(_a) {
  var network = _a.network,
    setNetwork = _a.setNetwork
  return _jsxs(_Fragment, {
    children: [
      _jsx(
        "label",
        __assign(
          { className: "block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white" },
          { children: "Network" }
        )
      ),
      _jsxs(
        "fieldset",
        __assign(
          { className: "flex" },
          {
            children: [
              _jsx("legend", __assign({ className: "sr-only" }, { children: "Network" })),
              _jsxs(
                "div",
                __assign(
                  { className: "flex items-center mr-4" },
                  {
                    children: [
                      _jsx("input", {
                        onChange: function () {
                          return setNetwork("mainnet")
                        },
                        checked: network === "mainnet",
                        id: "network-mainnet",
                        type: "radio",
                        name: "network",
                        value: "Mainnet",
                        className:
                          "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
                      }),
                      _jsx(
                        "label",
                        __assign(
                          {
                            htmlFor: "network-mainnet",
                            className:
                              "block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300"
                          },
                          { children: "Mainnet" }
                        )
                      )
                    ]
                  }
                )
              ),
              _jsxs(
                "div",
                __assign(
                  { className: "flex items-center mr-4" },
                  {
                    children: [
                      _jsx("input", {
                        onChange: function () {
                          return setNetwork("testnet")
                        },
                        checked: network === "testnet",
                        id: "network-testnet",
                        type: "radio",
                        name: "network",
                        value: "Testnet",
                        className:
                          "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
                      }),
                      _jsx(
                        "label",
                        __assign(
                          {
                            htmlFor: "network-testnet",
                            className:
                              "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                          },
                          { children: "Testnet" }
                        )
                      )
                    ]
                  }
                )
              ),
              _jsxs(
                "div",
                __assign(
                  { className: "flex items-center mr-4" },
                  {
                    children: [
                      _jsx("input", {
                        onChange: function () {
                          return setNetwork("regtest")
                        },
                        checked: network === "regtest",
                        id: "network-regtest",
                        type: "radio",
                        name: "network",
                        value: "Regtest",
                        className:
                          "w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"
                      }),
                      _jsx(
                        "label",
                        __assign(
                          {
                            htmlFor: "network-regtest",
                            className:
                              "block ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                          },
                          { children: "Regtest" }
                        )
                      )
                    ]
                  }
                )
              )
            ]
          }
        )
      )
    ]
  })
}
function UrlInput(_a) {
  var urlInputRef = _a.urlInputRef
  return _jsxs(_Fragment, {
    children: [
      _jsx(
        "div",
        __assign(
          { className: "mt-4 flex justify-between" },
          {
            children: _jsx(
              "label",
              __assign(
                { className: "block mb-2 text-sm font-medium text-gray-900 dark:text-white" },
                { children: "Node Url" }
              )
            )
          }
        )
      ),
      _jsx("input", {
        ref: urlInputRef,
        className:
          "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
      })
    ]
  })
}
function LoginButton(_a) {
  var mnemonic = _a.mnemonic,
    chain = _a.chain,
    network = _a.network,
    path = _a.path,
    url = _a.url,
    urlInputRef = _a.urlInputRef
  var showSnackBar = useUtilsComponents().showSnackBar
  var login = function (e) {
    var _a
    e.preventDefault()
    if (isLoggedIn()) showSnackBar("A user is already logged in, please log out first.", false)
    if (mnemonic.length === 0) showSnackBar("Please don't use an empty mnemonic string.", false)
    localStorage.setItem("BIP_39_KEY", mnemonic)
    localStorage.setItem("CHAIN", chain)
    localStorage.setItem("NETWORK", network)
    localStorage.setItem("PATH", path)
    localStorage.setItem(
      "URL",
      ((_a = urlInputRef.current) === null || _a === void 0 ? void 0 : _a.value) || url
    )
    window.location.href = "/"
  }
  return _jsx(_Fragment, {
    children: _jsx(
      "button",
      __assign(
        {
          onClick: login,
          type: "submit",
          className:
            "w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        },
        { children: "Log In" }
      )
    )
  })
}
function LoginForm() {
  var _a = useState(new Computer().getMnemonic()),
    mnemonic = _a[0],
    setMnemonic = _a[1]
  var _b = useState(
      (typeof process !== "undefined" && process.env.REACT_APP_CHAIN) || import.meta.env.VITE_CHAIN
    ),
    chain = _b[0],
    setChain = _b[1]
  var _c = useState(
      (typeof process !== "undefined" && process.env.REACT_APP_NETWORK) ||
        import.meta.env.VITE_NETWORK
    ),
    network = _c[0],
    setNetwork = _c[1]
  var url = useState(
    (typeof process !== "undefined" && process.env.REACT_APP_URL) || import.meta.env.VITE_URL
  )[0]
  var urlInputRef = useRef(null)
  useEffect(function () {
    initFlowbite()
  }, [])
  return _jsxs(_Fragment, {
    children: [
      _jsx(
        "div",
        __assign(
          { className: "max-w-sm mx-auto p-4 md:p-5 space-y-4" },
          {
            children: _jsx(
              "form",
              __assign(
                { className: "space-y-6" },
                {
                  children: _jsxs("div", {
                    children: [
                      _jsx(MnemonicInput, { mnemonic: mnemonic, setMnemonic: setMnemonic }),
                      !chain && _jsx(ChainInput, { chain: chain, setChain: setChain }),
                      !network && _jsx(NetworkInput, { network: network, setNetwork: setNetwork }),
                      !url && _jsx(UrlInput, { urlInputRef: urlInputRef })
                    ]
                  })
                }
              )
            )
          }
        )
      ),
      _jsx(
        "div",
        __assign(
          {
            className:
              "max-w-sm mx-auto flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600"
          },
          {
            children: _jsx(LoginButton, {
              mnemonic: mnemonic,
              chain: chain,
              network: network,
              url: url,
              urlInputRef: urlInputRef
            })
          }
        )
      )
    ]
  })
}
function LoginModal() {
  return _jsx(Modal.Component, { title: "Sign in", content: LoginForm, id: "sign-in-modal" })
}
export var Auth = {
  isLoggedIn: isLoggedIn,
  logout: logout,
  getCoinType: getCoinType,
  getBip44Path: getBip44Path,
  defaultConfiguration: loggedOutConfiguration,
  browserConfiguration: loggedInConfiguration,
  getComputer: getComputer,
  LoginForm: LoginForm,
  LoginModal: LoginModal
}
