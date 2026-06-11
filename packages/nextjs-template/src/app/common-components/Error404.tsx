import { Err } from "./Err";
import { Missing } from "./Missing";

export const Error404 = ({ message: m }: { message?: string }) => {
  return (
    <section className="w-full bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          {m ? <Err message={m} /> : <Missing />}
        </div>
      </div>
    </section>
  );
};
