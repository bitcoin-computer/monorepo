export function ShowDrawer({ text, id }: { text: string, id: string }) {
  return <button
    data-drawer-target={id}
    data-drawer-show={id}
    data-drawer-placement="right"
    aria-controls={id}>
    {text}
  </button>
}

export function Drawer({ Content, id }: any) {
  return (<div
      id={id}
      className="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform translate-x-full bg-white w-80 dark:bg-gray-800"
      tabIndex={-1}
      aria-labelledby="drawer-right-label">
    <button
      type="button"
      data-drawer-hide={id}
      aria-controls={id}
      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
      <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
      </svg>
      <span className="sr-only">Close menu</span>
    </button>
    {Content()}
  </div>)
}

