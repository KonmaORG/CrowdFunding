"use client";

import { useEffect, useState } from "react";
import { WalletIcon } from "lucide-react";
import type { EmulatorAccount } from "@lucid-evolution/lucid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

export default function EmulatorConnector() {
  const [walletConnection, setWalletConnection] = useWallet();
  const { lucid, isEmulator } = walletConnection;
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
        {} as Record<string, { account: EmulatorAccount; connected: boolean }>
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
        <DialogContent className="min-w-[350px]">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet to connect to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-wrap gap-4 items-center justify-center w-full">
              {Object.keys(wallets).map((key) => {
                const wallet = wallets[key];
                return (
                  <Button
                    key={key}
                    className="capitalize w-full flex justify-start"
                    variant={wallet.connected ? "default" : "outline"}
                    onClick={() => onConnectWallet(wallet.account)}
                  >
                    <span>{key}: </span>
                    <span>
                      {wallet.account.address.slice(0, 10) +
                        "..." +
                        wallet.account.address.slice(-24)}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            {/* Emulator Toggle  */}
            <div className="flex items-center justify-between rounded-lg border p-2 mx-2 w-full">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Emulator Mode</Label>
                <p className="text-sm text-muted-foreground">
                  This will use Emulator Accounts.
                </p>
              </div>
              <Switch
                id="emulator-toggle"
                checked={isEmulator}
                onCheckedChange={(checked) =>{
                  setIsOpen(false)
                  setTimeout(() => {
                    setWalletConnection((prev) => ({
                      ...prev,
                      isEmulator: checked,
                    }))
                  }, 500)
                }}
                aria-label="Toggle emulator mode"
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
