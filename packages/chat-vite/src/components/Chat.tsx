import { ComputerContext, Modal, sleep, UtilsContext } from "@bitcoin-computer/components"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { HiRefresh, HiUserAdd } from "react-icons/hi"

import { ChatSc } from "../contracts/chat"
const addUserModal = "add-user-modal"

interface messageI {
  text: string
  publicKey: string
  time: string
}
const getInitials = (name: string | undefined) => {
  if (!name) {
    return ""
  }
  const names = name.trim().split(" ")
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase()
}

const getColor = (publicKey: string) => {
  return `#${publicKey.slice(0, 6)}`
}

const getInitialsFromPublicKey = (publicKey: string) => {
  return (publicKey[0].charAt(0) + publicKey[3].charAt(0)).toUpperCase()
}

const formatTime = (str: string) => {
  const date = new Date(parseInt(str))
  let hours = date.getHours()
  let minutes = date.getMinutes()

  // Format time
  const formattedTime = `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`

  // Format date as dd mmm yy
  const day = date.getDate()
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear().toString().slice(-2)

  const formattedDate = `${day < 10 ? "0" + day : day} ${month}'${year}`

  return `${formattedDate} ${formattedTime}`
}

const ReceivedMessage = ({ message }: { message: messageI }) => {
  return (
    <div className="flex items-start gap-2.5 mb-4">
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
        style={{ backgroundColor: getColor(message.publicKey) }}
      >
        {getInitialsFromPublicKey(message.publicKey)}
      </div>
      <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
        <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{message.text}</p>
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {formatTime(message.time)}
        </span>
      </div>
    </div>
  )
}

const SentMessage = ({ message }: { message: messageI }) => {
  return (
    <div className="flex items-start justify-end gap-2.5 mb-4">
      <div className="flex flex-col items-end w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-blue-100 rounded-s-xl rounded-es-xl dark:bg-gray-700">
        <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{message.text}</p>
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {formatTime(message.time)}
        </span>
      </div>
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
        style={{ backgroundColor: getColor(message.publicKey) }}
      >
        {getInitialsFromPublicKey(message.publicKey)}
      </div>
    </div>
  )
}

function AddUserToChat(chatObj: ChatSc) {
  const [publicKey, setPublicKey] = useState("")
  const [creating, setCreating] = useState(false)
  const { showSnackBar } = UtilsContext.useUtilsComponents()

  const inviteUser = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      console.log(chatObj)
      await chatObj.invite(publicKey)
      setPublicKey("")
      showSnackBar("User added to the chat", true)
      Modal.hideModal(addUserModal)
    } catch (err) {
      if (err instanceof Error) {
        showSnackBar(err.message, false)
      }
    } finally {
      setCreating(false)
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
              Invite a User
            </label>
            <input
              type="text"
              id="name"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="User Public Key"
              required
            />
          </div>
          <button
            onClick={inviteUser}
            disabled={creating}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Invite
          </button>
        </div>
      </div>
    </>
  )
}

const ChatHeader = ({
  channelName,
  refreshChat,
  chatObj
}: {
  channelName?: string
  refreshChat: () => Promise<void>
  chatObj: ChatSc
}) => {
  const [addUserToChat, setAddUserToChat] = useState<ChatSc>()

  const addUser = (chat: ChatSc) => {
    setAddUserToChat(chat)
    Modal.showModal(addUserModal)
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-semibold"
          style={{ backgroundColor: "#0046FF" }}
        >
          {getInitials(channelName)}
        </div>
        <div className="ml-3">
          <h5 className="text-lg font-semibold text-gray-900 dark:text-white">{channelName}</h5>
          <span className="text-sm text-gray-500 dark:text-gray-400">Online</span>
        </div>
      </div>

      {/* Icon Group */}
      <div className="flex space-x-2">
        <HiRefresh
          onClick={refreshChat}
          className="w-6 h-6 cursor-pointer hover:opacity-80 dark:hover:opacity-80"
          style={{ color: "#999999" }}
        />
        <HiUserAdd
          onClick={() => addUser(chatObj)}
          className="w-6 h-6 cursor-pointer hover:opacity-80 dark:hover:opacity-80"
          style={{ color: "#999999" }}
        />
      </div>
      <Modal.Component
        title={"Add new user to chat"}
        content={AddUserToChat}
        id={addUserModal}
        contentData={addUserToChat}
      />
    </div>
  )
}

const ChatInput = ({
  disabled,
  refreshChat,
  chatId
}: {
  chatId: string
  disabled: boolean
  refreshChat: () => Promise<void>
}) => {
  const computer = useContext(ComputerContext)
  const [message, setMessage] = useState<string>("")
  const [sending, setSending] = useState(false)
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()

  const sendMessage = async () => {
    try {
      setSending(true)
      showLoader(true)
      const messageData: messageI = {
        text: message,
        publicKey: computer.getPublicKey(),
        time: Date.now().toString()
      }
      const latesRev = await computer.getLatestRev(chatId)
      const chatObj = (await computer.sync(latesRev)) as ChatSc
      await chatObj.post(JSON.stringify(messageData))
      await sleep(2000)
      await refreshChat()
      setMessage("")
    } catch (error) {
      if (error instanceof Error) showSnackBar(error.message, false)
    } finally {
      showLoader(false)
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          className="flex-1 p-2.5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder={disabled ? "You don't have access" : "Type your message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          onClick={sendMessage}
          type="button"
          className={`p-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 ${sending ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={sending || disabled}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export function Chat({ chatId }: { chatId: string }) {
  const computer = useContext(ComputerContext)
  const { showSnackBar, showLoader } = UtilsContext.useUtilsComponents()
  const navigate = useNavigate()
  const [id] = useState(chatId || "")
  const [chatObj, setChatObj] = useState<ChatSc | null>(null)
  const [messages, setMessages] = useState<messageI[]>([])

  const refreshChat = async () => {
    try {
      showLoader(true)
      const latesRev = await computer.getLatestRev(id)
      const synced = (await computer.sync(latesRev)) as ChatSc
      setChatObj(synced)
      const messagesData: messageI[] = []
      synced.messages.forEach((message) => {
        messagesData.push(JSON.parse(message))
      })
      setMessages(messagesData)
      showLoader(false)
    } catch (error) {
      showLoader(false)
      showSnackBar("Not a valid Chat", false)
    }
  }

  useEffect(() => {
    const fetch = async () => {
      await refreshChat()
    }
    fetch()
  }, [computer, id, chatId, location, navigate])

  return (
    <>
      <div className="grid grid-cols-1 gap-4 max-w max-h-screen">
        <div className="flex flex-col bg-gray-50 dark:bg-gray-800 max-w min-h-screen max-h-screen">
          {chatObj && (
            <>
              <ChatHeader
                channelName={chatObj.channelName}
                refreshChat={refreshChat}
                chatObj={chatObj}
              />

              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((data, index) =>
                  data.publicKey === computer.getPublicKey() ? (
                    <SentMessage message={data} key={`${chatObj?._id}_${index.toString()}`} />
                  ) : (
                    <ReceivedMessage message={data} key={`${chatObj?._id}_${index.toString()}`} />
                  )
                )}
              </div>

              <ChatInput
                chatId={id}
                disabled={!chatObj?._owners.includes(computer.getPublicKey())}
                refreshChat={refreshChat}
              />
            </>
          )}
        </div>
      </div>
    </>
  )
}
