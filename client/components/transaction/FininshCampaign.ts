"use client";

import { IdetificationPID, NETWORK, SIGNER1, SIGNER2, SIGNER3 } from "@/config";
import {
  CrowdfundingValidator,
  StateTokenValidator,
} from "@/config/scripts/scripts";
import { getAddress } from "@/lib/utils";
import { CampaignDatum } from "@/types/cardano";
import {
  Constr,
  Data,
  fromText,
  LucidEvolution,
  mintingPolicyToId,
  paymentCredentialOf,
  validatorToAddress,
} from "@lucid-evolution/lucid";

export async function FinishCampaign(lucid: LucidEvolution, address: string) {
  if (!lucid || !address) throw Error("Uninitialized Lucid!!!");
  const state_addr = getAddress(StateTokenValidator);

  const datum: CampaignDatum = {
    ...CampaignDatum,
    state: "Running",
  };
  let utxo = await lucid.utxosAt(address);
  const { txHash, outputIndex } = utxo[0];
  const oref = new Constr(0, [String(txHash), BigInt(outputIndex)]);
  const Campaign_Validator = CrowdfundingValidator([
    paymentCredentialOf(address).hash,
    oref,
    IdetificationPID,
  ]);
  const PID = mintingPolicyToId(Campaign_Validator);
  const state = fromText("STATE_TOKEN");
  const stateToken = { [`${PID}${state}`]: 1n };
  const crowfunding_addr = validatorToAddress(NETWORK, Campaign_Validator);
  const total_lovelace = await lucid.utxosAtWithUnit(
    crowfunding_addr,
    `${PID}${state}`
  );
  const ownerPay = calulatePayout(Number(datum.goal)).seller;
  const PlatformPay = calulatePayout(Number(datum.goal)).marketplace;
  let single, milestone;
  const tx = lucid
    .newTx()
    .pay.ToAddressWithData(
      state_addr,
      { kind: "inline", value: Data.to(datum, CampaignDatum) },
      { lovelace: 2_000_000n, ...stateToken }
    )
    .addSigner(SIGNER1)
    .addSigner(SIGNER2)
    .addSigner(SIGNER3);

  if (datum.milestone.length <= 0) {
    single = await tx.pay
      .ToAddress(address, { lovelace: 2_000_000n })
      .complete();
  } 
  // else {
  //   milestone = await tx.pay
  //     .ToAddress(crowfunding_addr, { lovelace: 2_000_000n })
  //     .validFrom(Math.floor(Number(datum.deadline)))
  //     .complete();
  // }
}

function calulatePayout(amount: number) {
  let platform = (amount * 5) / 100;
  let seller = amount - platform;

  return { marketplace: BigInt(platform + 10), seller: BigInt(seller + 10) };
}
