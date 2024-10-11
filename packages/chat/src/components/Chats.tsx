import { Auth, ComputerContext, Modal, UtilsContext } from "@bitcoin-computer/components"
import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { HiPlusCircle } from "react-icons/hi"

import { VITE_CHAT_MOD_SPEC } from "../constants/modSpecs"
import { ChatSc } from "../contracts/chat"
import { Chat } from "./Chat"

const newChatModal = "new-chat-modal"

function CreateNewChat() {
  const computer = useContext(ComputerContext)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()
  const navigate = useNavigate()

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      showLoader(true)
      setCreating(true)
      const { tx, effect } = await computer.encode({
        exp: `new ChatSc("${name}", "${computer.getPublicKey()}")`,
        mod: VITE_CHAT_MOD_SPEC
      })
      await computer.broadcast(tx)
      setName("")
      if (typeof effect.res === "object" && !Array.isArray(effect.res)) {
        showLoader(false)
        showSnackBar("You created a new chat", true)
        navigate(`/chats/${effect.res?._id as string}`)
        window.location.reload()
      }
    } catch (err) {
      if (err instanceof Error) {
        showSnackBar(err.message, false)
      }
    } finally {
      setCreating(false)
      showLoader(false)
    }
  }

  return (
    <>
      <div className="p-4 md:p-5">
        <div className="max-w-sm mx-auto">
          <div className="mb-5">
            <label
              htmlFor="user-address"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Channel Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Channel Name"
              required
            />
          </div>
          <button
            onClick={onSubmit}
            disabled={creating}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Create
          </button>
        </div>
      </div>
    </>
  )
}

export function Chats() {
  const computer = useContext(ComputerContext)
  const publicKey = Auth.getComputer().getPublicKey()
  const params = useParams()
  const navigate = useNavigate()
  const [chatId] = useState(params.id || "")
  const [chats, setChats] = useState<ChatSc[]>([])

  useEffect(() => {
    const fetch = async () => {
      const result = await computer.query({ mod: VITE_CHAT_MOD_SPEC, publicKey })
      const chatsPromise: Promise<ChatSc>[] = []
      result.forEach((rev: string) => {
        chatsPromise.push(computer.sync(rev) as Promise<ChatSc>)
      })

      Promise.allSettled(chatsPromise).then((results) => {
        const successfulChats = results
          .filter(
            (result): result is PromiseFulfilledResult<ChatSc> => result.status === "fulfilled"
          )
          .map((result) => result.value)

        setChats(successfulChats)
      })
    }
    fetch()
  }, [computer, location, navigate])

  const newChat = () => {
    Modal.showModal(newChatModal)
  }

  return (
    <>
      <div
        className="grid grid-cols-3 gap-4 w-full"
        style={{ height: "calc(100vh - 10vh)", maxHeight: "calc(100vh - 10vh)" }}
      >
        <div className="max-w">
          <div
            className="relative overflow-x-auto overflow-y-auto max-h-screen shadow-md sm:rounded-lg"
            style={{ maxHeight: "calc(100vh - 10vh)" }}
          >
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3 flex items-center justify-between">
                    My Chats
                    <HiPlusCircle
                      onClick={newChat}
                      className="w-6 h-6 cursor-pointer hover:opacity-80 dark:hover:opacity-80"
                      style={{ color: "#999999" }}
                      title="Create new chat"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {chats.map((chat) => (
                  <tr
                    key={chat._id}
                    className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600`}
                  >
                    <th
                      scope="row"
                      className={`px-6 py-4 font-medium cursor-pointer text-gray-900 whitespace-nowrap dark:text-white flex items-center justify-between ${chat._id === chatId ? "bg-gray-50 dark:bg-gray-600" : ""}`}
                      onClick={() => {
                        navigate(`/chats/${chat._id}`)
                        window.location.reload()
                      }}
                    >
                      <span className={` ${chat._id === chatId ? "font-bold" : ""}`}>
                        {chat.channelName}
                      </span>
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-span-2" style={{ maxHeight: "calc(100vh - 10vh)" }}>
          {chatId ? (
            <Chat chatId={chatId}></Chat>
          ) : (
            <div>
              <p className="mb-3 text-lg text-gray-500 md:text-xl dark:text-gray-400">
                Create new chat or select a existing existing one{" "}
              </p>
            </div>
          )}
        </div>
      </div>
      <Modal.Component title={"Create a New Chat"} content={CreateNewChat} id={newChatModal} />
    </>
  )
}
