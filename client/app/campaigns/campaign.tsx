"use client";

import {TokenCard} from "@/components/tokenCard";
import { IdetificationPID } from "@/config";
import { StateTokenValidator } from "@/config/scripts/scripts";
import { useWallet } from "@/context/walletContext";
import { datumDecoder, getAddress } from "@/lib/utils";
import { CampaignDatum } from "@/types/cardano";
import { UTxO } from "@lucid-evolution/lucid";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [walletConnection] = useWallet();
  const { lucid } = walletConnection;
  const [balance, setBalance] = useState<
  { unit: string; quantity: number; datum: CampaignDatum }[]
>([])

  useEffect(() => {
    if (!lucid) return;

      async function fetchutxos() {
        if (!lucid) return;
          const state_addr = getAddress(StateTokenValidator);
      const utxos = await lucid.utxosAt(state_addr);
    
      utxos.map(async (utxo) => {
        
        Object.entries(utxo.assets).map(async ([assetKey, quantity]) => {
          if (!assetKey.startsWith(IdetificationPID) && !assetKey.startsWith('lovelace')) {             
            const datum = await datumDecoder(lucid, utxo);
            setBalance((prev) => [
              ...prev,
              { unit: assetKey, quantity: Number(quantity), datum: datum },
            ]);
          }
        });
      });
    }
    fetchutxos();
  }, [lucid]);

  return (
    <div className='flex gap-4 flex-wrap'>
    {balance &&
      balance.map((token, index) => (
        <TokenCard
          key={index}
          datum={token.datum}
          qty={token.quantity}
          token={token.unit}
        />
      ))}
  </div>
  );
}
