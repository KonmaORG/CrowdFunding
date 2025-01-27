"use client";

import { useEffect, useState } from "react";
import { WalletIcon } from "lucide-react";
import type { EmulatorAccount } from "@lucid-evolution/lucid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/walletContext";
import { handleError } from "@/lib/utils";
import {
  accountA,
  accountB,
  accountC,
  accountD,
  emulator,
} from "@/config/emulator";
import { mkLucid } from "@/lib/lucid";

export default function WalletConnector() {
  const [walletConnection, setWalletConnection] = useWallet();
  const { lucid, address } = walletConnection;
  const [wallets, setWallets] = useState<
    Record<string, { account: EmulatorAccount; connected: boolean }>
  >({
    UserA: { account: accountA, connected: false },
    UserB: { account: accountB, connected: false },
    UserC: { account: accountC, connected: false },
    UserD: { account: accountD, connected: false },
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    mkLucid(setWalletConnection, true);
  }, []);

  async function onConnectWallet(account: EmulatorAccount) {
    setIsOpen(false);
    try {
      if (!lucid) throw "Uninitialized Lucid!!!";
      lucid.selectWallet.fromSeed(account.seedPhrase);
      const address = await lucid.wallet().address();
      const updatedWallets = Object.keys(wallets).reduce(
        (acc, key) => {
          acc[key] = {
            ...wallets[key],
            connected: wallets[key].account.seedPhrase === account.seedPhrase,
          };
          return acc;
        },
        {} as Record<string, { account: EmulatorAccount; connected: boolean }>,
      );
      setWallets(updatedWallets);
      setWalletConnection((walletConnection) => {
        return { ...walletConnection, address };
      });
      console.log("connected emulator wallet\n", address);
    } catch (error) {
      handleError(error);
    }
  }

  async function emulatorlog() {
    emulator.log();
  }

  async function awaitlog() {
    emulator.awaitBlock(1);
    console.log("block Height +1: ", emulator.blockHeight);
  }

  return (
    <div className="flex gap-2 items-center">
      <Button onClick={emulatorlog} className="w-fit">
        Log
      </Button>
      <Button onClick={awaitlog} className="w-fit">
        Await Block
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="icon">
            <WalletIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet to connect to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-wrap gap-4 w-56 items-center justify-center">
              {Object.keys(wallets).map((key) => {
                const wallet = wallets[key];
                return (
                  <Button
                    key={key}
                    className="capitalize"
                    variant={wallet.connected ? "default" : "outline"}
                    onClick={() => onConnectWallet(wallet.account)}
                  >
                    {key}:{" "}
                    {wallet.account.address.slice(0, 10) +
                      "..." +
                      wallet.account.address.slice(-25)}
                  </Button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
