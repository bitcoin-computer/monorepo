"use client";
import { ComputerContext, Gallery } from "../common-components";
import { useContext } from "react";
import { NEXT_PUBLIC_COUNTER_MOD_SPEC } from "../contracts/modSpecs";

export default function MyAssets() {
  const computer = useContext(ComputerContext);

  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">My Counters</h2>
      {computer && !!computer.getPublicKey() && (
        <Gallery.WithPagination
          mod={NEXT_PUBLIC_COUNTER_MOD_SPEC}
          publicKey={computer.getPublicKey()}
        />
      )}
    </>
  );
}
