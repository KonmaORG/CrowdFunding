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

  useEffect(() => {
    if (!lucid) return;
    const fetchUtxos = async () => {
      const state_addr = getAddress(StateTokenValidator);

      const utxos = await lucid.utxosAt(state_addr);
      const filteredUtxos = utxos.filter((utxo) => {
        const assets = utxo.assets;
        return Object.keys(assets).some((key) =>
          key.startsWith(IdetificationPID)
        );
      });

      setProjects(utxos);
    };
    fetchUtxos();
  }, [lucid]);

  return (
    <div>
      {projects.length > 0 ? (
        <ul>
          {projects.map((utxo, index) => (
            <li key={index}>
              <strong>Tx Hash:</strong> {utxo.txHash} <br />
              <strong>Index:</strong> {utxo.outputIndex} <br />
              <strong>Assets:</strong>{" "}
              {JSON.stringify(utxo.assets, (_, value) =>
                typeof value === "bigint" ? value.toString() : value
              )}
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
