"use client";

import { useWallet } from "@/context/walletContext";
import dynamic from "next/dynamic";
const WalletComponent = dynamic(() => import("./connector"), { ssr: false });
const EmulatorConnector = dynamic(() => import("./emulator"), { ssr: false });

export default function WalletConnector() {
  const [walletConnection] = useWallet();
  const { isEmulator } = walletConnection;
  return isEmulator ? <EmulatorConnector /> : <WalletComponent />;
}
