import {
  IdetificationPID,
  NETWORK,
  PLATFORMADDR,
  SIGNER1,
  SIGNER2,
} from "@/config";
import {
  CrowdfundingValidator,
  StateTokenValidator,
} from "@/config/scripts/scripts";
import {
  FindRefUtxo,
  getAddress,
  multiSignwithPrivateKey,
  privateKeytoAddress,
} from "@/lib/utils";
import {
  CampaignActionRedeemer,
  CampaignDatum,
  CampaignStateRedeemer,
} from "@/types/cardano";
import {
  Constr,
  credentialToAddress,
  Data,
  fromText,
  keyHashToCredential,
  mintingPolicyToId,
  UTxO,
  validatorToAddress,
} from "@lucid-evolution/lucid";
import { Milestone } from "lucide-react";

export async function ReleaseFunds(
  WalletConnection: any,
  datum: any,
  metadata: any
) {
  const { address, lucid } = WalletConnection;
  try {
    if (!address || !lucid) throw Error("Wallet not Conencted");
    // oref
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
    // tokens
    const stateTokenKey = policyId + fromText("STATE_TOKEN");
    // utxos
    const campaignUtxos = await lucid.utxosAt(contarctAddress);
    const state_utxo = await lucid.utxosAtWithUnit(state_addr, stateTokenKey);
    const ref_utxo = await FindRefUtxo(lucid, state_addr);
    // datum & redeemers
    // datum.milestone[datum.milestone.indexOf(false)] = true
    let updatedDatum: CampaignDatum = {
      ...datum,
      state: "Finished",
      milestone: datum.milestone.map((val: any, i: any, a: boolean[]) =>
        i === a.indexOf(false) ? true : val
      ),
    };
    // Campaign creator Address
    const pc = keyHashToCredential(datum.creator[0]);
    const sc = keyHashToCredential(datum.creator[1]);
    const creatorAddress = credentialToAddress(NETWORK, pc, sc);
    // calculating pay
    const totalLovelace = sumUtxoAmounts(campaignUtxos).lovelace;
    const { platform, creator, script } = calulatePay(
      Number(totalLovelace),
      datum.milestone
    );

    // tx
    let tx = lucid
      .newTx()
      .readFrom(ref_utxo)
      .collectFrom(campaignUtxos, CampaignActionRedeemer.Release)
      .collectFrom(state_utxo, CampaignStateRedeemer.Released)
      .pay.ToContract(
        state_addr,
        { kind: "inline", value: Data.to(updatedDatum, CampaignDatum) },
        { lovelace: 2_000_000n, [stateTokenKey]: 1n }
      )
      .pay.ToAddress(creatorAddress, { lovelace: creator })
      .pay.ToAddress(PLATFORMADDR, { lovelace: platform })
      .attach.SpendingValidator(Campaign_Validator)
      .attach.SpendingValidator(StateTokenValidator())
      .addSigner(await privateKeytoAddress(SIGNER1))
      .addSigner(await privateKeytoAddress(SIGNER2));

    if (script) {
      tx = await tx.pay
        .ToContract(
          contarctAddress,
          { kind: "inline", value: Data.to(updatedDatum, CampaignDatum) },
          { lovelace: script as bigint }
        )
        .complete();
    } else {
      tx = await tx.complete();
    }

    console.log("tx complete");
    // submit and sign by multisig
    multiSignwithPrivateKey(tx, [SIGNER1, SIGNER2]);
    const sign = await tx.sign.withWallet().complete();
    const txHash = await sign.submit();
    console.log(txHash);
  } catch (err: any) {
    console.log(err.message);
    return err.message;
  }
}

function calulatePay(amount: number, milestone: boolean[]) {
  const remainingMilestones = milestone.filter((val) => val === false).length;

  let platform = Math.ceil((amount * 5) / 100 / remainingMilestones);
  let creator = Math.ceil((amount - platform) / remainingMilestones);
  let script = Math.ceil(amount - amount / remainingMilestones);
  return {
    platform: BigInt(platform),
    creator: BigInt(creator),
    script: remainingMilestones > 1 ? BigInt(script) : null,
  };
}

function sumUtxoAmounts(utxos: UTxO[]) {
  return utxos.reduce(
    (acc, utxo) => {
      const assets = utxo.assets || {};
      acc.lovelace += assets.lovelace || 0n;
      return acc;
    },
    { lovelace: 0n }
  );
}
