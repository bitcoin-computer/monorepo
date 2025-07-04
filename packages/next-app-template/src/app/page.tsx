"use client";
import { Gallery } from "./common-components";
import { NEXT_PUBLIC_COUNTER_MOD_SPEC } from "./contracts/modSpecs";

export default function AllAssets() {
  return (
    <>
      <h2 className="text-4xl font-bold dark:text-white">All Counters</h2>
      <Gallery.WithPagination mod={NEXT_PUBLIC_COUNTER_MOD_SPEC} />
    </>
  );
}
