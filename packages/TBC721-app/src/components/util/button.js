function Button ({ onClick, disabled, children, color = 'blue' }) {

  const ButtonBlue = ({ onClick, disabled, children }) => {
    if (disabled)
      return (<button disabled type="button" className="text-white bg-blue-400 dark:bg-blue-500 cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center">{children}</button>)
    return (<button onClick={onClick} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">{children}</button>)
  }

  const ButtonWhite = ({ onClick, disabled, children }) => {
    if (disabled)
      return (<button type="button" className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-400 bg-white rounded-lg border border-gray-200 cursor-not-allowed opacity-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:opacity-50 dark:cursor-not-allowed dark:focus:ring-gray-700">{children}</button>)
    return (<button onClick={onClick} type="button" className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">{children}</button>)
  }

  if (color === 'blue') {
    return <ButtonBlue onClick={onClick} disabled={disabled}>{children}</ButtonBlue>
  } else if (color === 'white') {
    return <ButtonWhite onClick={onClick} disabled={disabled}>{children}</ButtonWhite>
  } else {
    throw new Error('Invalid button color')
  }
}

export default Button
