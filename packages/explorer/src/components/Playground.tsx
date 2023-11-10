import { useEffect, useRef, useState } from "react"
import Dropdown from "./Utils/Dropdown"

interface Argument {
  type: string
  value: string
}

const Playground = () => {
  const [code, setCode] = useState<string>()
  const [argumentsList, setArgumentsList] = useState<Argument[]>([])

  const handleAddArgument = () => {
    setArgumentsList([...argumentsList, { type: "", value: "" }])
  }

  const handleArgumentChange = (index: number, field: "type" | "value", value: string) => {
    const updatedArguments = [...argumentsList]
    updatedArguments[index][field] = value
    setArgumentsList(updatedArguments)
  }

  const handleDeploy = () => {
    console.log("Deploying smart contract:", { code, argumentsList })
    // Add logic for deploying the smart contract using computer.new
  }

  return (
    <>
      <div className="pt-4 w-full relative">
        <textarea
          id="message"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your JS class and code here"
          rows={10}
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white font-mono" // Added font-mono for monospaced font
          style={{ tabSize: 2, MozTabSize: 2, OTabSize: 2, WebkitTabSize: 2 } as any} // Set tab size to 2 spaces
          spellCheck="false" // Disable spell check
          autoCapitalize="none" // Disable auto capitalization
          autoComplete="off" // Disable auto completion
          autoCorrect="off" // Disable auto correction
          wrap="off" // Disable word wrapping
        ></textarea>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleAddArgument}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Add Argument
          </button>

          {argumentsList.map((argument, index) => (
            <div key={index} className="mt-2 flex items-center mb-2">
              <Dropdown
                onSelectMethod={(option) => {
                  console.log(option)
                }}
                options={["String", "Number"]}
                selectionTitle={"Select Type"}
              />
              <input
                type="text"
                id="default-input"
                value={argument.value}
                onChange={(e) => handleArgumentChange(index, "value", e.target.value)}
                placeholder="Enter argument value"
                className="w-full ml-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleDeploy}
          className="mt-2 text-white bg-green-500 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
        >
          Call Deploy
        </button>
      </div>
    </>
  )
}

export default Playground
