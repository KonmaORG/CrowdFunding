"use client";

import dynamic from "next/dynamic";
const WalletConnector = dynamic(() => import("./walletConnector"), {
  ssr: false,
});

export default function TmpWalletConnector() {
  return <WalletConnector />;
}
