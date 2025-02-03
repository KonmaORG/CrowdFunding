"use client";
import { WalletConnection } from "@/context/walletContext";
import { IdetificationPID, NETWORK, SIGNER1, SIGNER2, SIGNER3 } from "@/config";
import {
  CrowdfundingValidator,
  StateTokenValidator,
} from "@/config/scripts/scripts";
import { getAddress } from "@/lib/utils";
import {
  CampaignActionRedeemer,
  CampaignDatum,
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
    const stateToken = { [`${policyId}${state}`]: 1n };
    const rewardTokenKey = `${policyId}${datum.name}`;
    // utxo lovelace
    const { lovelace, rewardToken } = sumUtxoAmounts(utxos, rewardTokenKey);
    const rewardTokenBurn = { [rewardTokenKey]: -rewardToken };
    // const ownerPay = calulatePayout(Number(datum.goal)).seller;
    // const PlatformPay = calulatePayout(Number(datum.goal)).marketplace;

    // add state token with updated datum and must send back to state_script
    // all utxos must go to self_address
    // attach ref_utxo
    const tx = lucid
      .newTx()
      .collectFrom(utxos, redeemer)
      .pay.ToAddressWithData(
        state_addr,
        { kind: "inline", value: Data.to(updatedDatum, CampaignDatum) },
        { lovelace: 2_000_000n, ...stateToken }
      )
      .pay.ToAddressWithData(
        contarctAddress,
        { kind: "inline", value: Data.to(updatedDatum, CampaignDatum) },
        { lovelace: lovelace }
      )
      .mintAssets(rewardTokenBurn, Data.to(updatedDatum, CampaignDatum))
      .addSigner(address)
      .complete();
    // else {
    //   milestone = await tx.pay
    //     .ToAddress(crowfunding_addr, { lovelace: 2_000_000n })
    //     .validFrom(Math.floor(Number(datum.deadline)))
    //     .complete();
    // }
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
