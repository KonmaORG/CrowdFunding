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
  "6346a72cdf9901b504d120bba53708cea2c013cb050bc5534d8f666a"; //preview
// "93a74c2bd74b872e0e895269626ce4c94f13a45f3743c63e17a8e513"; //emulator

export const PLATFORMADDR =
  "addr_test1qp8lyrn3hpt07xf45qg5n0q9qcqanlfu08ja27ek6antfeswpy2laxtnvd8l78fxuw8fx5yse93a2guf9uap9adfflnsvd3vw6";

export const SIGNER1 = process.env.NEXT_PUBLIC_SIGNER_1 as string;
export const SIGNER2 = process.env.NEXT_PUBLIC_SIGNER_2 as string;
export const SIGNER3 = process.env.NEXT_PUBLIC_SIGNER_3 as string;
