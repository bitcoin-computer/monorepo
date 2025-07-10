// src/app/common-components/ClientProviders.tsx
"use client";

import React, { useEffect, useState } from "react";
import { initFlowbite } from "flowbite";
import { UtilsProvider } from "./UtilsContext";
import { ComputerContext } from "./ComputerContext";
import { getComputer } from "./Auth";
import { Computer } from "@bitcoin-computer/lib";
import dynamic from "next/dynamic";

const Wallet = dynamic(() => import("./Wallet").then((mod) => mod.Wallet), {
  ssr: false,
});

const Navbar = dynamic(() => import("./Navbar").then((mod) => mod.Navbar), {
  ssr: false,
});

const LoginModal = dynamic(
  () => import("./Auth").then((mod) => mod.Auth.LoginModal),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [computer, setComputer] = useState<Computer | null>(null);
  console.log(computer)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setComputer(getComputer());
    }
  }, []);

  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <UtilsProvider>
      <ComputerContext.Provider value={computer}>
        {computer ? (
          <>
            <LoginModal />
            <Wallet />
            <div className="dark:bg-gray-800 min-h-screen">
              <Navbar />
              <div className="m-4 bg-gray-100 dark:bg-gray-800">{children}</div>
            </div>
          </>
        ) : (
          <></>
        )}
      </ComputerContext.Provider>
    </UtilsProvider>
  );
}
