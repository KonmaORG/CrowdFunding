import { getPolicyId } from "@/lib/utils";
import {
  Blockfrost,
  Network,
  Provider,
  validatorToAddress,
} from "@lucid-evolution/lucid";

export const BF_URL = process.env.NEXT_PUBLIC_BF_URL!;
export const BF_PID = process.env.NEXT_PUBLIC_BF_PID!;
const NETWORKx = process.env.NEXT_PUBLIC_CARDANO_NETWORK as Network;

export const NETWORK: Network = NETWORKx;
export const PROVIDER: Provider = new Blockfrost(BF_URL, BF_PID);

export const IdetificationPID =
  "74b1986cd1738268f3240bff99e6236c67ea313dc3dd996ff93ce950"; //preview
// "e06db29b847b254143a3d4f1aea4fab0f2179ccb0d378d7c831e5a8f"; //emulator

export const PLATFORMADDR =
  "addr_test1qp8lyrn3hpt07xf45qg5n0q9qcqanlfu08ja27ek6antfeswpy2laxtnvd8l78fxuw8fx5yse93a2guf9uap9adfflnsvd3vw6";

export const SIGNER1 = process.env.NEXT_PUBLIC_SIGNER_1 as string;
export const SIGNER2 = process.env.NEXT_PUBLIC_SIGNER_2 as string;
export const SIGNER3 = process.env.NEXT_PUBLIC_SIGNER_3 as string;
