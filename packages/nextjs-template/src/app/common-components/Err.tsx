export const Err = ({ message }: { message: string }) => (
  <>
    <h1 className="mb-4 text-6xl tracking-tight font-extrabold text-blue-700 dark:text-blue-600">
      400
    </h1>
    <p className="mb-4 text-3xl tracking-tight font-bold text-gray-700 md:text-4xl dark:text-white">
      Something went wrong.
    </p>
    <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
      {message}
    </p>
  </>
);
