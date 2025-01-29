import { IdetificationPID, NETWORK, PROVIDER } from "@/config";
import {
  fromText,
  LucidEvolution,
  makeWalletFromPrivateKey,
  MintingPolicy,
  mintingPolicyToId,
  Script,
  TxSignBuilder,
  Validator,
  validatorToAddress,
} from "@lucid-evolution/lucid";
import { Validation } from "@react-types/shared";
import { clsx, type ClassValue } from "clsx";
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
    const txHash = await sign.submit();
    console.log("tx", txHash);
  } catch (e) {
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

export async function FindRefUtxo(lucid: LucidEvolution, address: string) {
  const asset = fromText("ConfigNFT");
  const token = `${IdetificationPID}${asset}`;
  const UtoAsset = await lucid.utxosAtWithUnit(address, token);
  return UtoAsset;
}
