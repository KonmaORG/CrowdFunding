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
  "5777d51de31b9cb5c8b9543f39aada65a3a23054df9dc0f5289716a9"; //preview
// "93a74c2bd74b872e0e895269626ce4c94f13a45f3743c63e17a8e513"; //emulator

export const PLATFORMADDR =
  "addr1qxu75psqc5c234da4tpzuqymmru6reqlaulq25k8ecqc53krhru8dgujmceyjamw6m636jzcdv834nkgll2nlpuyak6s2vnyff";

export const SIGNER1 = process.env.NEXT_PUBLIC_SIGNER_1 as string;
export const SIGNER2 = process.env.NEXT_PUBLIC_SIGNER_2 as string;
export const SIGNER3 = process.env.NEXT_PUBLIC_SIGNER_3 as string;
