import UserGamesList from './UserGamesList'

const MyGames = () => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dark:bg-gray-900">
        <div className="md:col-span-3">
          <UserGamesList />
        </div>
      </div>
    </div>
  )
}

export { MyGames }
