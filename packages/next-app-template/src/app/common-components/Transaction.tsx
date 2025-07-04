import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import reactStringReplace from "react-string-replace";
import { Computer } from "@bitcoin-computer/lib";
import { Card } from "./Card";
import { ComputerContext } from "./ComputerContext";

function ExpressionCard({
  content,
  env,
}: {
  content: string;
  env: { [s: string]: string };
}) {
  const entries = Object.entries(env);
  let formattedContent = content as any;
  entries.forEach((entry) => {
    const [name, rev] = entry;
    const regExp = new RegExp(`(${name})`, "g");
    const replacer = (n: string, ind: number) => (
      <Link
        key={`${rev}|${ind}`}
        href={`/objects/${rev}`}
        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        {n}
      </Link>
    );
    formattedContent = reactStringReplace(formattedContent, regExp, replacer);
  });
  return <Card content={formattedContent} />;
}

function Component() {
  const params = useParams();
  const computer = useContext(ComputerContext);
  const [txn, setTxn] = useState<string>(
    typeof params.txn === "string"
      ? decodeURIComponent(params.txn)
      : decodeURIComponent(params.txn?.[0] || "")
  );
  const [txnData, setTxnData] = useState<any | null>(null);
  const [rpcTxnData, setRPCTxnData] = useState<any | null>(null);
  const [transition, setTransition] = useState<any | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (computer) {
        setTxn(
          typeof params.txn === "string"
            ? decodeURIComponent(params.txn)
            : decodeURIComponent(params.txn?.[0] || "")
        );
        const [hex] = await computer.wallet.restClient.getRawTxs([
          params.txn as string,
        ]);
        const tx = Computer.txFromHex({ hex });
        setTxnData(tx);

        const { result } = await computer.rpcCall(
          "getrawtransaction",
          `${params.txn} 2`
        );
        setRPCTxnData(result);
      }
    };
    fetch();
  }, [computer, txn, params.txn]);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (txnData && computer) setTransition(await computer.decode(txnData));
      } catch (err) {
        if (err instanceof Error) {
          setTransition("");

          console.log("Error parsing transaction", err.message);
        }
      }
    };
    fetch();
  }, [computer, txnData, txn]);

  const envTable = (env: { [s: string]: string }) => (
    <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Name
          </th>
          <th scope="col" className="px-6 py-3 break-keep">
            Output
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(env).map(([name, output]) => (
          <tr
            key={output}
            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
          >
            <td className="px-6 py-4 break-all">{name}</td>
            <td className="px-6 py-4">
              <Link
                href={`/objects/${output}`}
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                {output}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const transitionComponent = () => (
    <div>
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Expression</h2>
      <ExpressionCard content={transition.exp} env={transition.env} />

      <h2 className="mb-2 text-4xl font-bold dark:text-white">Environment</h2>
      {envTable(transition.env)}

      {transition.mod && (
        <>
          <h2 className="mb-2 text-4xl font-bold dark:text-white">
            Module Specifier
          </h2>
          <Card content={transition.mod} />
        </>
      )}
    </div>
  );

  const inputsComponent = () => (
    <div className="relative overflow-x-auto sm:rounded-lg">
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Inputs</h2>

      <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Transaction Id
            </th>
            <th scope="col" className="px-6 py-3 break-keep">
              Output Number
            </th>
            <th scope="col" className="px-6 py-3">
              Script
            </th>
          </tr>
        </thead>
        <tbody>
          {rpcTxnData?.vin?.map((input: any, ind: any) => (
            <tr
              key={`${input.txid}|${ind}`}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="px-6 py-4 break-all">
                <Link
                  href={`/transactions/${input.txid}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {input.txid}
                </Link>
              </td>

              <td className="px-6 py-4">
                <Link
                  href={`/objects/${input.txid}:${input.vout}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  #{input.vout}
                </Link>
              </td>

              <td className="px-6 py-4 break-all">{input.scriptSig?.asm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const outputsComponent = () => (
    <div className="relative overflow-x-auto">
      <h2 className="mb-2 text-4xl font-bold dark:text-white">Objects</h2>

      <table className="w-full mt-4 mb-8 text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Number
            </th>

            <th scope="col" className="px-6 py-3">
              Value
            </th>
            <th scope="col" className="px-6 py-3">
              Type
            </th>
            <th scope="col" className="px-6 py-3">
              Script PubKey
            </th>
          </tr>
        </thead>
        <tbody>
          {rpcTxnData?.vout?.map((output: any) => (
            <tr
              key={output.n}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
            >
              <td className="px-6 py-4 break-all">
                <Link
                  href={`/objects/${txn}:${output.n}`}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  #{output.n}
                </Link>
              </td>

              <td className="px-6 py-4">{output.value}</td>
              <td className="px-6 py-4">{output.scriptPubKey.type}</td>
              <td className="px-6 py-4 break-all">{output.scriptPubKey.asm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="pt-8">
        <h1 className="mb-2 text-5xl font-extrabold dark:text-white">
          Transaction
        </h1>
        <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          {txn}
        </p>

        {transition && transitionComponent()}

        {rpcTxnData?.vin && inputsComponent()}

        {rpcTxnData?.vout && outputsComponent()}
      </div>
    </>
  );
}

export const Transaction = { Component };
