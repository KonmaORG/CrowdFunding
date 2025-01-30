"use client";

import TokenCard from "@/components/tokenCard";
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
  const [projects, setProjects] = useState<UTxO[]>([]);
  const [balance, setBalance] = useState<
  { unit: string; quantity: number; datum: CampaignDatum }[]
>([])

  useEffect(() => {
    if (!lucid) return;
    // const fetchUtxos = async () => {
      
    //   const utxos = await lucid.utxosAt(state_addr);
    //   const filteredUtxos = utxos.filter((utxo) => {
      //     const assets = utxo.assets;
      //     return Object.keys(assets).some((key) =>
      //       key.startsWith(IdetificationPID)
      //     );
      //   });
      
      //   setProjects(utxos);
      // };
      // fetchUtxos();
      async function fetchutxos() {
        if (!lucid) return;
          const state_addr = getAddress(StateTokenValidator);
      const utxos = await lucid.utxosAt(state_addr);
    
      utxos.map(async (utxo) => {
        const datum = await datumDecoder(lucid, utxo);
    
        Object.entries(utxo.assets).map(([assetKey, quantity]) => {
          if (!assetKey.startsWith(IdetificationPID)) { 
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
      balance.map((token) => (
        <TokenCard
          key={token.unit}
          datum={token.datum}
          qty={token.quantity}
          token={token.unit}
        />
      ))}
  </div>
  );
}
