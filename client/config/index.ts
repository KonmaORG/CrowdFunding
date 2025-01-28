import { getPolicyId } from "@/lib/utils";
import {
  Blockfrost,
  Network,
  Provider,
  validatorToAddress,
} from "@lucid-evolution/lucid";
import {
  IdentificationNFTValidator,
  StateTokenValidator,
} from "./scripts/scripts";

export const BF_URL = process.env.NEXT_PUBLIC_BF_URL!;
export const BF_PID = process.env.NEXT_PUBLIC_BF_PID!;
const NETWORKx = process.env.NEXT_PUBLIC_CARDANO_NETWORK as Network;

export const NETWORK: Network = NETWORKx;
export const PROVIDER: Provider = new Blockfrost(BF_URL, BF_PID);

export const IdetificationPID =
  "93a74c2bd74b872e0e895269626ce4c94f13a45f3743c63e17a8e513";

export const PLATFORMADDR =
  "addr1qxu75psqc5c234da4tpzuqymmru6reqlaulq25k8ecqc53krhru8dgujmceyjamw6m636jzcdv834nkgll2nlpuyak6s2vnyff";
