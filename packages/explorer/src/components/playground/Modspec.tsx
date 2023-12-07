export const ModSpec = ({ modSpec, setModSpec }: { modSpec: any; setModSpec: any }) => {
  return (
    <>
      <div>
        <div className="flex mb-2 mt-2">
          <h1 className="text-xl font-bold dark:text-white">
            Module Specifier
            <small className="ms-2 font-semibold text-gray-500 dark:text-gray-400">Optional</small>
          </h1>
        </div>
        <input
          type="text"
          value={modSpec}
          onChange={(e) => setModSpec(e.target.value)}
          className="sm:w-full md:w-2/3 lg:w-1/2 mr-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="mod spec"
          required
        />
      </div>
    </>
  )
}
