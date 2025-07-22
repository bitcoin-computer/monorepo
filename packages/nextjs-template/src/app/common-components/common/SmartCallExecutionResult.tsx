import Link from "next/link";
import { useRouter } from "next/navigation";

 
export function FunctionResultModalContent({ functionResult }: any) {
  const router = useRouter();

  if (
    functionResult &&
    typeof functionResult === "object" &&
    !Array.isArray(functionResult)
  )
    return (
      <>
        <div
          id="smart-call-execution-success"
          className="p-4 md:p-5 dark:text-gray-400"
        >
          You created a&nbsp;
          <Link
            id="smart-call-execution-counter-link"
            href={`/objects/${functionResult._rev}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            onClick={() => {
              router.push(`/objects/${functionResult._rev}`);
            }}
          >
            smart object
          </Link>
          .
        </div>
      </>
    );

  if (functionResult._rev && functionResult.res.toString())
    return (
      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        You created the value below at Revision {functionResult._rev}
        <pre>{functionResult.res.toString()}</pre>
      </p>
    );

  return (
    <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 p-2">
      {functionResult}
    </p>
  );
}
