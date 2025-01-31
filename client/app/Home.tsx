"use client";

import { IdetificationPID } from "@/config";
import { StateTokenValidator } from "@/config/scripts/scripts";
import { useWallet } from "@/context/walletContext";
import { getAddress } from "@/lib/utils";
import { UTxO } from "@lucid-evolution/lucid";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [walletConnection] = useWallet();
  const { lucid } = walletConnection;
  const [projects, setProjects] = useState<UTxO[]>([]);
  const [balance, setBalance] = useState<
  { unit: string; quantity: number}[]
>([])
  useEffect(() => {
    if (!lucid) return;
    // const fetchUtxos = async () => {
    //   const state_addr = getAddress(StateTokenValidator);

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
            
        
            Object.entries(utxo.assets).map(([assetKey, quantity]) => {
              if (!assetKey.startsWith(IdetificationPID) && !assetKey.startsWith('lovelace')) { 
                console.log(assetKey, quantity);
                setBalance((prev) => [
                  ...prev,
                  { unit: assetKey, quantity: Number(quantity) },
                ]);
              }
            });
          });
        }
        fetchutxos();
  }, [lucid]);

  return (
    <div>
      {balance.length > 0 ? (
        <ul>
          {balance.map((utxo, index) => (
            <li key={index}>
             {utxo.unit} : {utxo.quantity}
            </li>
          ))}
          <br />
          <br />
        </ul>
      ) : (
        <p>No matching UTXOs found</p>
      )}
    </div>
  );
}
