import { BF_PID, BF_URL, IdetificationPID, NETWORK, PROVIDER } from "@/config";
import { CampaignDatum } from "@/types/cardano";
import {
  credentialToAddress,
  Data,
  fromText,
  keyHashToCredential,
  LucidEvolution,
  makeWalletFromPrivateKey,
  MintingPolicy,
  mintingPolicyToId,
  Script,
  TxSignBuilder,
  UTxO,
  Validator,
  validatorToAddress,
} from "@lucid-evolution/lucid";
import { Validation } from "@react-types/shared";
import { clsx, type ClassValue } from "clsx";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleError(error: any) {
  // const { info, message } = error;

  function toJSON(error: any) {
    try {
      const errorString = JSON.stringify(error);
      const errorJSON = JSON.parse(errorString);

      return errorJSON;
    } catch {
      return {};
    }
  }

  const { cause } = toJSON(error);
  const { failure } = cause ?? {};

  const failureCause = failure?.cause;
  // const failureInfo = failureCause?.info;
  // const failureMessage = failureCause?.message;

  // toast(`${failureInfo ?? failureMessage ?? info ?? message ?? error}`, {
  // type: "error",
  // });
  console.error(failureCause ?? { error });
}

export function getAddress(validatorFucntion: { (): Validator; (): Script }) {
  const validator: Validator = validatorFucntion();
  const address = validatorToAddress(NETWORK, validator);
  return address;
}

export function getPolicyId(validatorFucntion: { (): Validator; (): Script }) {
  const validator: MintingPolicy = validatorFucntion();
  const Pid = mintingPolicyToId(validator);
  return Pid;
}

export async function submit(tx: TxSignBuilder) {
  try {
    const sign = await tx.sign.withWallet().complete();
    console.log("signed");
    const txHash = await sign.submit();
    console.log("submitted");
    console.log("tx", txHash);
  } catch (e: any) {
    console.log("error", e);
    console.log("error", JSON.stringify(e));
    throw e;
  }
}

export async function privateKeytoAddress(privateKey: string) {
  const privateeyAddress = await makeWalletFromPrivateKey(
    PROVIDER,
    NETWORK,
    privateKey
  ).address();
  return privateeyAddress;
}

export function multiSignwithPrivateKey(
  tx: TxSignBuilder,
  privateKeys: string[]
) {
  let signed = tx;
  for (const privateKey of privateKeys) {
    signed = signWithPrivateKey(signed, privateKey);
  }
  return signed;
}
export function signWithPrivateKey(tx: TxSignBuilder, privateKey: string) {
  const signed = tx.sign.withPrivateKey(privateKey);
  return signed;
}

export async function FindRefUtxo(lucid: LucidEvolution, address: string) {
  const asset = fromText("ConfigNFT");
  const token = `${IdetificationPID}${asset}`;
  const UtoAsset = await lucid.utxosAtWithUnit(address, token);
  return UtoAsset;
}

export async function datumDecoder(lucid: LucidEvolution, utxo: UTxO) {
  const data = await lucid.datumOf(utxo);
  const datum = Data.castFrom(data, CampaignDatum);
  return datum;
}

export function toAda(value: BigInt) {
  return Number(value) / 1_000_000;
}
export function toLovelace(value: number) {
  return BigInt(value * 1_000_000);
}

export function tupleToAddress(tuple: [string, string]) {
  const pc = keyHashToCredential(tuple[0]);
  const sc = keyHashToCredential(tuple[1]);
  const address = credentialToAddress(NETWORK, pc, sc);
  return address;
}

export const blockfrost = {
  getMetadata: async (asset: string) => {
    const url = `${BF_URL}/assets/${asset}`;

    try {
      // const assetResponse = await fetch(url, {
      //   method: "GET",
      //   headers: {
      //     project_id: BF_PID,
      //   },
      // });

      // if (!assetResponse.ok) {
      //   throw new Error(`Error: ${assetResponse.statusText}`);
      // }

      // const result = await assetResponse.json();
      // return result.onchain_metadata;
      return {
        name: "STATE_TOKEN",
        campaignName: "abc",
        image: "https://avatars.githubusercontent.com/u/106166350",
        description: "dfff",
        hash: "7ad94b23c8e67fc1369b7d453c00b75d116abe36a4689cdde58402661cf8c73c",
        outputIndex: 1,
        address:
          "addr_test1wpr0gn86hs7d2lxkuwqw9va6qjcx8vrmhalfxrzy9f848cqd8q8td",
      };
    } catch (err: any) {
      return err.message;
    }
  },

  getLatestTime: async () => {
    const url = `${BF_URL}/blocks/latest`;

    try {
      const assetResponse = await fetch(url, {
        method: "GET",
        headers: {
          project_id: BF_PID,
        },
      });

      if (!assetResponse.ok) {
        throw new Error(`Error: ${assetResponse.statusText}`);
      }

      const result = await assetResponse.json();
      return result.time * 1000;
    } catch (err: any) {
      return err.message;
    }
  },
};
