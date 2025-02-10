import { createContext, Dispatch, SetStateAction, useContext } from "react";
import {
  Address,
  LucidEvolution,
  PaymentKeyHash,
  StakeKeyHash,
} from "@lucid-evolution/lucid";

import { Wallet } from "@/types/cardano";

export type WalletConnection = {
  lucid?: LucidEvolution;
  wallet?: Wallet;
  address?: Address;
  balance?: number;
  pkh?: PaymentKeyHash;
  skh?: StakeKeyHash;
  isEmulator: boolean;
};

export const WalletContext = createContext<
  [WalletConnection, Dispatch<SetStateAction<WalletConnection>>]
>([{ isEmulator: false }, () => {}]);
export const useWallet = () => useContext(WalletContext);
