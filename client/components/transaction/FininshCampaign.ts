"use client";
import { WalletConnection } from "@/context/walletContext";
import { IdetificationPID, NETWORK, SIGNER1, SIGNER2, SIGNER3 } from "@/config";
import {
  CrowdfundingValidator,
  StateTokenValidator,
} from "@/config/scripts/scripts";
import { FindRefUtxo, getAddress, submit } from "@/lib/utils";
import {
  CampaignActionRedeemer,
  CampaignDatum,
  CampaignState,
  CampaignStateRedeemer,
  MetadataType,
} from "@/types/cardano";
import {
  Constr,
  Data,
  fromText,
  LucidEvolution,
  mintingPolicyToId,
  paymentCredentialOf,
  UTxO,
  validatorToAddress,
} from "@lucid-evolution/lucid";

export async function FinishCampaign(
  WalletConnection: WalletConnection,
  datum: CampaignDatum,
  metadata: MetadataType
) {
  const { lucid, address } = WalletConnection;
  try {
    if (!address || !lucid) throw Error("Wallet not Conencted");

    const oref = new Constr(0, [
      String(metadata.hash),
      BigInt(metadata.outputIndex),
    ]);
    // validator parameter
    const Campaign_Validator = CrowdfundingValidator([
      datum.creator[0],
      oref,
      IdetificationPID,
    ]);
    // validator address & policyId
    const contarctAddress = validatorToAddress(NETWORK, Campaign_Validator);
    const policyId = mintingPolicyToId(Campaign_Validator);
    const state_addr = getAddress(StateTokenValidator);
    // Datum & Redeemer
    const updatedDatum: CampaignDatum = {
      ...datum,
      state: "Finished",
    };
    const redeemer = CampaignActionRedeemer.Finish;
    let utxos = await lucid.utxosAt(contarctAddress);
    // tokens
    const state = fromText("STATE_TOKEN");
    const stateTokenKey = `${policyId}${state}`;
    const stateToken = { [stateTokenKey]: 1n };
    const rewardTokenKey = `${policyId}${datum.name}`;
    // utxo lovelace
    const { lovelace, rewardToken } = sumUtxoAmounts(utxos, rewardTokenKey);
    const rewardTokenBurn = { [rewardTokenKey]: -rewardToken };
    // state token utxo
    const state_utxo = await lucid.utxosAtWithUnit(state_addr, stateTokenKey);
    // ref_utxo
    const ref_utxo = await FindRefUtxo(lucid, state_addr);

    console.log("lovelace rewardtoken", lovelace, -rewardToken);
    console.log("campaign utxos", utxos);
    const tx = await lucid
      .newTx()
      .readFrom(ref_utxo)
      .collectFrom(utxos, redeemer)
      .collectFrom(state_utxo, CampaignStateRedeemer.Finished)
      .pay.ToContract(
        state_addr,
        { kind: "inline", value: Data.to(updatedDatum, CampaignDatum) },
        { lovelace: 2_000_000n, ...stateToken }
      )
      .pay.ToContract(
        contarctAddress,
        { kind: "inline", value: Data.to(updatedDatum, CampaignDatum) },
        { lovelace: lovelace }
      )
      .mintAssets(rewardTokenBurn, Data.to(updatedDatum, CampaignDatum))
      .attach.SpendingValidator(Campaign_Validator)
      .attach.SpendingValidator(StateTokenValidator())
      .addSigner(address)
      .complete();

    console.log("tx complete", tx);
    // submit(tx);
  } catch (error) {
    console.log(error);
  }
}

function calulatePayout(amount: number) {
  let platform = (amount * 5) / 100;
  let seller = amount - platform;

  return { marketplace: BigInt(platform + 10), seller: BigInt(seller + 10) };
}

function sumUtxoAmounts(utxos: UTxO[], rewardTokenKey: string) {
  return utxos.reduce(
    (acc, utxo) => {
      const assets = utxo.assets || {};
      acc.lovelace += assets.lovelace || 0n;
      acc.rewardToken += assets[rewardTokenKey] || 0n;
      return acc;
    },
    { lovelace: 0n, rewardToken: 0n }
  );
}
