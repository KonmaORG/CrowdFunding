import { Lucid } from "@lucid-evolution/lucid";

import { NETWORK, PROVIDER } from "@/config";
import { WalletConnection } from "@/context/walletContext";
import { emulator } from "@/config/emulator";

export const mkLucid = async (
  setWalletConnection: (value: React.SetStateAction<WalletConnection>) => void,
  isEmulator?: boolean,
): Promise<void> => {
  try {
    let lucidInstance;
    if (isEmulator) {
      lucidInstance = await Lucid(emulator, "Custom");
    } else {
      lucidInstance = await Lucid(PROVIDER, NETWORK);
    }

    setWalletConnection((prev) => ({
      ...prev,
      lucid: lucidInstance,
    }));
  } catch (error) {
    console.error("Error initializing Lucid:", error);
  }
};
