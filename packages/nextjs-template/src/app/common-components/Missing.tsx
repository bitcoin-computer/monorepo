import Link from "next/link";

export const Missing = () => (
  <>
    <h1 className="mb-4 text-6xl tracking-tight font-extrabold text-blue-700 dark:text-blue-600">
      404
    </h1>
    <p className="mb-4 text-3xl tracking-tight font-bold text-gray-700 md:text-4xl dark:text-white">
      Something&apos;s missing.
    </p>
    <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
      Sorry, we can&apos;t find that page. You&apos;ll find lots to explore on
      the home page.
    </p>
    <Link
      href="/"
      className="inline-flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-900 my-4"
    >
      Back to Homepage
    </Link>
  </>
);
